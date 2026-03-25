import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { API_CLIENT_MODEL } from 'src/modules/auth/auth.constants';
import { APIClient } from 'src/modules/auth/entities/api-client.model';
import { Permission } from 'src/modules/auth/entities/permission.model';

@Injectable()
export class APIClientsService {
   constructor(
      @Inject(API_CLIENT_MODEL)
      private readonly apiClientModel: typeof APIClient,
   ) {}

   async findActiveByUsername(username: string): Promise<APIClient | null> {
      const normalized = (username || '').trim();
      if (!normalized) return null;

      return this.apiClientModel.findOne({
         where: {
            username: { [Op.eq]: normalized },
            isActive: true,
         },
      });
   }

   async validatePassword(client: APIClient, rawPassword: string): Promise<boolean> {
      if (!client?.passwordHash || !rawPassword) return false;
      return bcrypt.compare(rawPassword, client.passwordHash);
   }

   async getPermissionNames(clientId: string): Promise<string[]> {
      const client = await this.apiClientModel.findByPk(clientId, {
         include: [
            {
               model: Permission,
               through: { attributes: [] },
               attributes: ['name'],
            },
         ],
      });

      if (!client?.permissions?.length) return [];
      return client.permissions.map((permission) => permission.name);
   }
}
