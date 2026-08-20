import * as http from 'http';
import * as https from 'https';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { REQUEST_ID_HEADER, RequestContext } from 'src/Core/Logging/RequestContext';
import { RequestLoggingService } from 'src/Core/Logging/RequestLogging.service';
import {
   HttpInstrumentationOptions,
   resolveHttpInstrumentationOptions,
} from './HttpInstrumentation.options';

/**
 * A plain string key on purpose: axios rebuilds the config object on every retry
 * (mergeConfig), and only string keys survive that copy - a Symbol would not.
 */
const CALL_META = '__httpInstrumentationMeta';

type CallMeta = {
   /** Start of the very first attempt. */
   startedAt: number;
   /** Start of the attempt currently in flight. */
   attemptStartedAt: number;
   /** 1 for the first try. */
   attempt: number;
   integration: string;
   url: string;
};

type InstrumentedConfig = InternalAxiosRequestConfig & {
   [CALL_META]?: CallMeta;
   __httpInstrumentationMeta?: CallMeta;
};

const SAFE_METHODS = ['get', 'head', 'options'];
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const MAX_LOGGED_URL_LENGTH = 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Every integration in this project talks to its third party API through axios
 * (either the default export or Nest's HttpService). Instead of editing ~20
 * integration files, this service installs interceptors on both axios instances
 * so that *every* outbound call gets:
 *
 *   - a default timeout, so one hanging upstream cannot pin a client request open
 *   - bounded retries with exponential backoff + jitter for transient failures
 *   - keep-alive connection pooling (TLS handshakes are a real cost here)
 *   - a structured timing log line, correlated to the inbound request id
 */
@Injectable()
export class HttpInstrumentationService implements OnModuleInit {
   private readonly logger = new Logger('OutboundHttp');
   private readonly options: HttpInstrumentationOptions;
   private readonly instrumented = new WeakSet<object>();
   private readonly httpAgent: http.Agent;
   private readonly httpsAgent: https.Agent;
   private integrationPrefixes: Array<{ name: string; prefix: string }> = [];

   constructor(
      private readonly configService: ConfigService,
      private readonly httpService: HttpService,
      private readonly requestLoggingService: RequestLoggingService,
   ) {
      this.options = resolveHttpInstrumentationOptions(this.configService);

      const agentOptions = {
         keepAlive: this.options.keepAlive,
         maxSockets: this.options.maxSockets,
         maxFreeSockets: this.options.maxFreeSockets,
      };

      this.httpAgent = new http.Agent(agentOptions);
      this.httpsAgent = new https.Agent(agentOptions);
   }

   onModuleInit(): void {
      this.integrationPrefixes = this.buildIntegrationPrefixes();

      this.instrument(axios as unknown as AxiosInstance);
      this.instrument(this.httpService.axiosRef);

      this.logger.log(
         `Outbound HTTP instrumentation enabled ${JSON.stringify({
            defaultTimeoutMs: this.options.defaultTimeoutMs,
            retryAttempts: this.options.retryAttempts,
            unsafeRetryMode: this.options.unsafeRetryMode,
            keepAlive: this.options.keepAlive,
            knownIntegrations: this.integrationPrefixes.length,
         })}`,
      );
   }

   private instrument(instance: AxiosInstance): void {
      if (!instance || this.instrumented.has(instance)) {
         return;
      }
      this.instrumented.add(instance);

      instance.interceptors.request.use((config: InstrumentedConfig) => {
         return this.onRequest(config);
      });

      instance.interceptors.response.use(
         (response) => {
            this.onSettled(response.config as InstrumentedConfig, response.status, null);
            return response;
         },
         (error: AxiosError) => this.onError(instance, error),
      );
   }

   private onRequest(config: InstrumentedConfig): InstrumentedConfig {
      const now = Date.now();

      if (!config[CALL_META]) {
         const url = this.buildUrl(config);
         config[CALL_META] = {
            startedAt: now,
            attemptStartedAt: now,
            attempt: 1,
            integration: this.resolveIntegration(url),
            url: this.sanitizeUrl(url),
         };
      } else {
         config[CALL_META].attemptStartedAt = now;
      }

      if (!config.timeout && this.options.defaultTimeoutMs > 0) {
         config.timeout = this.options.defaultTimeoutMs;
      }

      // Never override an integration's own agent (several use client certificates).
      if (!config.httpAgent) {
         config.httpAgent = this.httpAgent;
      }
      if (!config.httpsAgent) {
         config.httpsAgent = this.httpsAgent;
      }

      const requestId = RequestContext.getRequestId();
      if (requestId && config.headers && !config.headers[REQUEST_ID_HEADER]) {
         config.headers[REQUEST_ID_HEADER] = requestId;
      }

      return config;
   }

   private async onError(instance: AxiosInstance, error: AxiosError): Promise<never> {
      const config = error.config as InstrumentedConfig;

      if (!config || !config[CALL_META]) {
         return Promise.reject(error);
      }

      const meta = config[CALL_META];

      if (this.shouldRetry(error, meta.attempt)) {
         const delayMs = this.retryDelayMs(meta.attempt);
         const waitedMs = Date.now() - meta.attemptStartedAt;

         this.logger.warn(
            this.line({
               event: 'upstream_retry',
               integration: meta.integration,
               method: this.methodOf(config),
               url: meta.url,
               attempt: meta.attempt,
               waitedMs,
               retryInMs: delayMs,
               reason: this.describeError(error),
            }),
         );

         meta.attempt += 1;
         await sleep(delayMs);

         return instance.request(config) as Promise<never>;
      }

      this.onSettled(config, error.response ? error.response.status : null, error);

      return Promise.reject(error);
   }

   private onSettled(
      config: InstrumentedConfig,
      statusCode: number | null,
      error: AxiosError | null,
   ): void {
      if (!config || !config[CALL_META]) {
         return;
      }

      const meta = config[CALL_META];
      const durationMs = Date.now() - meta.startedAt;
      const timedOut = this.isTimeout(error);
      const requestId = RequestContext.getRequestId();
      const message = error ? this.describeError(error) : null;

      RequestContext.addUpstreamCall({
         integration: meta.integration,
         method: this.methodOf(config),
         url: meta.url,
         statusCode,
         durationMs,
         attempts: meta.attempt,
         timedOut,
         error: message,
      });

      const payload = this.line({
         event: 'upstream_call',
         requestId,
         integration: meta.integration,
         method: this.methodOf(config),
         url: meta.url,
         statusCode,
         durationMs,
         attempts: meta.attempt,
         timedOut,
         error: message,
      });

      if (error) {
         this.logger.error(payload);
      } else if (durationMs >= this.options.slowUpstreamWarnMs) {
         this.logger.warn(payload);
      } else {
         this.logger.log(payload);
      }

      if (this.options.persistUpstreamCalls) {
         void this.requestLoggingService.createIntegrationLog({
            requestId,
            integration: meta.integration,
            method: this.methodOf(config),
            url: meta.url,
            statusCode,
            durationMs,
            attempts: meta.attempt,
            timedOut,
            error: message,
         });
      }
   }

   private shouldRetry(error: AxiosError, attempt: number): boolean {
      if (attempt > this.options.retryAttempts) {
         return false;
      }

      // Request was cancelled by the caller - retrying would be wrong.
      if (error.code === 'ERR_CANCELED') {
         return false;
      }

      const status = error.response ? error.response.status : null;
      const timedOut = this.isTimeout(error);
      const noResponse = !error.response && !timedOut;
      const retryableStatus = status !== null && RETRYABLE_STATUS_CODES.includes(status);
      const method = this.methodOf(error.config as InstrumentedConfig);

      if (SAFE_METHODS.includes(method.toLowerCase())) {
         return timedOut || noResponse || retryableStatus;
      }

      switch (this.options.unsafeRetryMode) {
         case 'always':
            return timedOut || noResponse || retryableStatus;
         case 'never':
            return false;
         default:
            // The upstream never answered, so it most likely never processed the payload.
            return noResponse;
      }
   }

   private retryDelayMs(attempt: number): number {
      const exponential = this.options.retryBaseDelayMs * Math.pow(2, attempt - 1);
      const capped = Math.min(exponential, this.options.retryMaxDelayMs);
      // Full jitter, so parallel client requests do not retry in lockstep.
      return Math.round(capped / 2 + Math.random() * (capped / 2));
   }

   private isTimeout(error: AxiosError | null): boolean {
      if (!error) {
         return false;
      }
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
         return true;
      }
      return typeof error.message === 'string' && error.message.includes('timeout of');
   }

   private describeError(error: AxiosError): string {
      const code = error.code ? `${error.code}: ` : '';
      return `${code}${error.message || 'Unknown error'}`.slice(0, 500);
   }

   private methodOf(config: InstrumentedConfig): string {
      return (config && config.method ? config.method : 'get').toUpperCase();
   }

   private buildUrl(config: InstrumentedConfig): string {
      const url = config.url || '';
      const baseUrl = config.baseURL || '';

      if (!baseUrl || /^https?:\/\//i.test(url)) {
         return url;
      }

      return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
   }

   private sanitizeUrl(url: string): string {
      const withoutQuery = this.options.logUpstreamQuery ? url : url.split('?')[0];
      return withoutQuery.slice(0, MAX_LOGGED_URL_LENGTH);
   }

   /**
    * Derives a readable integration name from the *_URL / *_ENDPOINT environment
    * variables, so log lines say STATE_POPULATION_REGISTER instead of a bare host.
    */
   private buildIntegrationPrefixes(): Array<{ name: string; prefix: string }> {
      const prefixes: Array<{ name: string; prefix: string }> = [];

      for (const [key, value] of Object.entries(process.env)) {
         if (!value || !/^https?:\/\//i.test(value)) {
            continue;
         }
         if (!/(URL|URI|ENDPOINT)$/i.test(key)) {
            continue;
         }

         const name = key.replace(/_?(API)?_?(URL|URI|ENDPOINT)$/i, '') || key;
         prefixes.push({ name, prefix: value.replace(/\/+$/, '') });
      }

      return prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
   }

   private resolveIntegration(url: string): string {
      if (!url) {
         return 'unknown';
      }

      const match = this.integrationPrefixes.find((entry) => url.startsWith(entry.prefix));
      if (match) {
         return match.name;
      }

      try {
         return new URL(url).host;
      } catch {
         return 'unknown';
      }
   }

   private line(payload: Record<string, unknown>): string {
      const compact: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(payload)) {
         if (value !== null && value !== undefined) {
            compact[key] = value;
         }
      }

      return JSON.stringify(compact);
   }
}
