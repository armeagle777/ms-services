import { Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { PERMISSION_MODEL } from 'src/modules/auth/auth.constants';
import { Permission } from 'src/modules/auth/entities/permission.model';

@Injectable()
export class PermissionsService {
   constructor(
      @Inject(PERMISSION_MODEL)
      private readonly permissionModel: typeof Permission,
   ) {}

   async ensurePermissionsExist(names: string[]): Promise<void> {
      const normalized = Array.from(new Set(names.map((name) => name.trim().toLowerCase()))).filter(
         Boolean,
      );
      if (!normalized.length) return;

      const existing = await this.permissionModel.findAll({
         where: { name: { [Op.in]: normalized } },
         attributes: ['name'],
      });

      const existingSet = new Set(existing.map((record) => record.name));
      const missing = normalized.filter((name) => !existingSet.has(name));

      if (!missing.length) return;

      await this.permissionModel.bulkCreate(
         missing.map((name) => ({
            name,
            description: `Auto-discovered permission: ${name}`,
         })),
      );
   }
}
