import {
   AllowNull,
   BelongsTo,
   Column,
   CreatedAt,
   DataType,
   Default,
   ForeignKey,
   Model,
   PrimaryKey,
   Table,
   Unique,
} from 'sequelize-typescript';
import { APIClient } from './api-client.model';
import { Permission } from './permission.model';

@Table({
   tableName: 'api_client_permissions',
   timestamps: true,
   createdAt: 'created_at',
   updatedAt: false,
})
export class APIClientPermission extends Model<APIClientPermission> {
   @PrimaryKey
   @Default(DataType.UUIDV4)
   @Column({ type: DataType.UUID })
   declare id: string;

   @Unique('client_permission_unique')
   @ForeignKey(() => APIClient)
   @AllowNull(false)
   @Column({ field: 'client_id', type: DataType.UUID })
   declare clientId: string;

   @Unique('client_permission_unique')
   @ForeignKey(() => Permission)
   @AllowNull(false)
   @Column({ field: 'permission_id', type: DataType.UUID })
   declare permissionId: string;

   @CreatedAt
   @Column({ field: 'created_at', type: DataType.DATE })
   declare createdAt: Date;

   @BelongsTo(() => APIClient)
   declare client?: APIClient;

   @BelongsTo(() => Permission)
   declare permission?: Permission;
}
