import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { PermissionsService } from 'src/modules/permissions/permissions.service';

@Injectable()
export class PermissionScannerService implements OnApplicationBootstrap {
   private readonly logger = new Logger(PermissionScannerService.name);

   constructor(
      private readonly discoveryService: DiscoveryService,
      private readonly metadataScanner: MetadataScanner,
      private readonly permissionsService: PermissionsService,
   ) {}

   async onApplicationBootstrap(): Promise<void> {
      const permissions = this.discoverPermissions();
      await this.permissionsService.ensurePermissionsExist(permissions);
      this.logger.log(`Discovered ${permissions.length} permission(s)`);
   }

   private discoverPermissions(): string[] {
      const discovered = new Set<string>();
      const controllers = this.discoveryService.getControllers();

      for (const wrapper of controllers) {
         const metatype = wrapper.metatype;
         if (!metatype || !metatype.prototype) continue;

         const controllerName = this.normalizeControllerName(metatype.name);
         if (!controllerName) continue;

         this.metadataScanner.scanFromPrototype(
            wrapper.instance,
            metatype.prototype,
            (methodKey: string) => {
               const handler = metatype.prototype[methodKey];
               if (typeof handler !== 'function') return;

               const hasRouteMethod = Reflect.getMetadata(METHOD_METADATA, handler) !== undefined;
               const hasRoutePath = Reflect.getMetadata(PATH_METADATA, handler) !== undefined;
               if (!hasRouteMethod && !hasRoutePath) return;

               const action = this.normalizeActionName(methodKey);
               discovered.add(`${controllerName}.${action}`);
            },
         );
      }

      return [...discovered].sort();
   }

   private normalizeControllerName(className: string): string {
      return (className || '').replace(/Controller$/i, '').trim().toLowerCase();
   }

   private normalizeActionName(handlerName: string): string {
      const normalized = (handlerName || '').trim();
      const rules: Array<{ pattern: RegExp; value: string }> = [
         { pattern: /^search/i, value: 'search' },
         { pattern: /^get/i, value: 'get' },
         { pattern: /^create/i, value: 'create' },
         { pattern: /^update/i, value: 'update' },
         { pattern: /^delete/i, value: 'delete' },
      ];

      const matched = rules.find((rule) => rule.pattern.test(normalized));
      if (matched) return matched.value;
      return normalized.toLowerCase();
   }
}
