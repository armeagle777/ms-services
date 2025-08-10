import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';

@Injectable()
export class SignatureVerificationMiddleware implements NestMiddleware {
   private publicKey: string;

   constructor() {
      // Load your .pem public key
      this.publicKey = fs.readFileSync('path/to/public.pem', 'utf8');
   }

   use(req: any, res: any, next: () => void) {
      const signature = req.headers['x-signature'] as string;
      if (!signature) {
         throw new UnauthorizedException('Missing signature');
      }

      const rawBody = JSON.stringify(req.body); // Must be raw or canonical form

      const isVerified = crypto.verify(
         'RSA-SHA256',
         Buffer.from(rawBody),
         this.publicKey,
         Buffer.from(signature, 'base64'),
      );

      if (!isVerified) {
         throw new UnauthorizedException('Invalid signature');
      }

      next();
   }
}
