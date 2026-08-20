import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

/** A single outbound (third party) call made while handling one inbound request. */
export type UpstreamCallRecord = {
   integration: string;
   method: string;
   url: string;
   statusCode: number | null;
   durationMs: number;
   attempts: number;
   timedOut: boolean;
   error: string | null;
};

export type RequestStore = {
   requestId: string;
   startedAt: number;
   username: string | null;
   upstreamCalls: UpstreamCallRecord[];
};

const storage = new AsyncLocalStorage<RequestStore>();

/** Hard cap so a pathological loop cannot grow the per-request store without bound. */
const MAX_TRACKED_UPSTREAM_CALLS = 50;

/**
 * Per-request state shared between the inbound logging interceptor and the
 * outbound HTTP instrumentation, without having to thread a context object
 * through every service and integration signature.
 */
export const RequestContext = {
   create(requestId?: string): RequestStore {
      return {
         requestId: requestId || randomUUID(),
         startedAt: Date.now(),
         username: null,
         upstreamCalls: [],
      };
   },

   run<T>(store: RequestStore, callback: () => T): T {
      return storage.run(store, callback);
   },

   get(): RequestStore | undefined {
      return storage.getStore();
   },

   getRequestId(): string | null {
      const store = storage.getStore();
      return store ? store.requestId : null;
   },

   setUsername(username: string | null): void {
      const store = storage.getStore();
      if (store) {
         store.username = username;
      }
   },

   addUpstreamCall(record: UpstreamCallRecord): void {
      const store = storage.getStore();
      if (!store || store.upstreamCalls.length >= MAX_TRACKED_UPSTREAM_CALLS) {
         return;
      }
      store.upstreamCalls.push(record);
   },

   getUpstreamCalls(): UpstreamCallRecord[] {
      const store = storage.getStore();
      return store ? store.upstreamCalls : [];
   },

   /** Total wall time spent waiting on third party APIs for the current request. */
   upstreamTotalMs(): number {
      const store = storage.getStore();
      if (!store) {
         return 0;
      }
      return store.upstreamCalls.reduce((total, call) => total + call.durationMs, 0);
   },
};
