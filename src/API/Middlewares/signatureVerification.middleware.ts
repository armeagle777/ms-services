import * as fs from 'fs';
import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SignatureVerificationMiddleware implements NestMiddleware {
   private publicKey: string;

   constructor() {
      this.publicKey = fs.readFileSync('./src/API/Certificates/migration-request.pem', 'utf8');
   }

   use(req: Request, res: Response, next: NextFunction) {
      const signature = req.headers['x-signature'] as string;
      if (!signature) {
         throw new UnauthorizedException('Missing signature');
      }
      const rawBody = JSON.stringify(req.body);

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
