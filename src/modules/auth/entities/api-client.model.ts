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
import { APIClientPermission } from './api-client-permission.model';
import { Permission } from './permission.model';

@Table({
   tableName: 'api_clients',
   timestamps: true,
   createdAt: 'created_at',
   updatedAt: false,
})
export class APIClient extends Model<APIClient> {
   @PrimaryKey
   @Default(DataType.UUIDV4)
   @Column({ type: DataType.UUID })
   declare id: string;

   @AllowNull(false)
   @Column({ type: DataType.STRING(255) })
   declare name: string;

   @Unique
   @AllowNull(false)
   @Column({ type: DataType.STRING(255) })
   declare username: string;

   @AllowNull(false)
   @Column({ field: 'password_hash', type: DataType.STRING(255) })
   declare passwordHash: string;

   @AllowNull(false)
   @Default(true)
   @Column({ field: 'is_active', type: DataType.BOOLEAN })
   declare isActive: boolean;

   @CreatedAt
   @Column({ field: 'created_at', type: DataType.DATE })
   declare createdAt: Date;

   @BelongsToMany(() => Permission, () => APIClientPermission)
   declare permissions?: Permission[];

   @HasMany(() => APIClientPermission)
   declare clientPermissions?: APIClientPermission[];
}
