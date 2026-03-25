import {
   CanActivate,
   ExecutionContext,
   ForbiddenException,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { APIClientsService } from 'src/modules/api-clients/api-clients.service';
import { APIClient } from 'src/modules/auth/entities/api-client.model';

type AuthenticatedRequest = Request & {
   client?: APIClient;
};

@Injectable()
export class PermissionGuard implements CanActivate {
   constructor(private readonly apiClientsService: APIClientsService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const client = request.client;

      if (!client?.id) {
         throw new UnauthorizedException('Authenticated client not found in request context');
      }

      const controller = this.normalizeControllerName(context.getClass().name);
      const action = this.normalizeActionName(context.getHandler().name);
      const permission = `${controller}.${action}`;
      const wildcardPermission = `${controller}.*`;

      const grantedPermissions = await this.apiClientsService.getPermissionNames(client.id);
      const allowed =
         grantedPermissions.includes(permission) || grantedPermissions.includes(wildcardPermission);

      if (!allowed) {
         throw new ForbiddenException(`Missing permission: ${permission}`);
      }

      return true;
   }

   private normalizeControllerName(className: string): string {
      const base = (className || '').replace(/Controller$/i, '').trim();
      return base.toLowerCase();
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
