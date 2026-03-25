import {
   CanActivate,
   ExecutionContext,
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
export class BasicAuthGuard implements CanActivate {
   constructor(private readonly apiClientsService: APIClientsService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      const authHeader = request.headers.authorization || '';

      if (!authHeader.startsWith('Basic ')) {
         throw new UnauthorizedException('Missing Basic authorization header');
      }

      const base64Credentials = authHeader.slice('Basic '.length).trim();
      let decoded: string;

      try {
         decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      } catch {
         throw new UnauthorizedException('Invalid Basic auth encoding');
      }

      const separatorIndex = decoded.indexOf(':');
      if (separatorIndex < 0) {
         throw new UnauthorizedException('Invalid Basic auth format');
      }

      const username = decoded.slice(0, separatorIndex).trim();
      const password = decoded.slice(separatorIndex + 1);
      if (!username || !password) {
         throw new UnauthorizedException('Invalid Basic auth credentials');
      }

      const client = await this.apiClientsService.findActiveByUsername(username);
      if (!client) {
         throw new UnauthorizedException('Invalid username or password');
      }

      const isValid = await this.apiClientsService.validatePassword(client, password);
      if (!isValid) {
         throw new UnauthorizedException('Invalid username or password');
      }

      request.client = client;
      return true;
   }
}
