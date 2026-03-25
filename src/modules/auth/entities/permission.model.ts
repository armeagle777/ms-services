import {
   AllowNull,
   BelongsToMany,
   Column,
   CreatedAt,
   DataType,
   Default,
   HasMany,
   Model,
   PrimaryKey,
   Table,
   Unique,
} from 'sequelize-typescript';
import { APIClient } from './api-client.model';
import { APIClientPermission } from './api-client-permission.model';

@Table({
   tableName: 'permissions',
   timestamps: true,
   createdAt: 'created_at',
   updatedAt: false,
})
export class Permission extends Model<Permission> {
   @PrimaryKey
   @Default(DataType.UUIDV4)
   @Column({ type: DataType.UUID })
   declare id: string;

   @Unique
   @AllowNull(false)
   @Column({ type: DataType.STRING(255) })
   declare name: string;

   @AllowNull(false)
   @Default('')
   @Column({ type: DataType.STRING(1024) })
   declare description: string;

   @CreatedAt
   @Column({ field: 'created_at', type: DataType.DATE })
   declare createdAt: Date;

   @BelongsToMany(() => APIClient, () => APIClientPermission)
   declare clients?: APIClient[];

   @HasMany(() => APIClientPermission)
   declare clientPermissions?: APIClientPermission[];
}
