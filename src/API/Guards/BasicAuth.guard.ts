import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/Core/Auth/Auth.service';

@Injectable()
export class BasicAuthGuard implements CanActivate {
   constructor(private readonly authService: AuthService) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const authHeader = request.headers.authorization || '';

      if (!authHeader.startsWith('Basic ')) {
         throw new UnauthorizedException('Missing Basic authorization header');
      }

      const base64Credentials = authHeader.slice('Basic '.length).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex < 0) {
         throw new UnauthorizedException('Invalid Basic auth format');
      }

      const username = decoded.slice(0, separatorIndex);
      const password = decoded.slice(separatorIndex + 1);
      const isValid = await this.authService.validateBasicCredentials(username, password);

      if (!isValid) {
         throw new UnauthorizedException('Invalid username or password');
      }

      return true;
   }
}
