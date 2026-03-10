import { Inject, Injectable } from '@nestjs/common';
import { AUTH_USER_MODEL } from 'src/Infrustructure/Database/database.tokens';
import { AuthUserEntity } from 'src/Infrustructure/Database/Entities/AuthUser.entity';

@Injectable()
export class AuthService {
   constructor(
      @Inject(AUTH_USER_MODEL)
      private readonly authUserModel: typeof AuthUserEntity,
   ) {}

   async validateBasicCredentials(username: string, password: string): Promise<boolean> {
      const normalizedUsername = (username || '').trim();
      if (!normalizedUsername || !password) {
         return false;
      }

      const user = await this.authUserModel.findOne({ where: { username: normalizedUsername } });
      if (!user) {
         return false;
      }

      return user.password === password;
   }
}
