import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type IntegrationCallLogAttributes = {
   id: number;
   requestId: string | null;
   integration: string;
   method: string;
   url: string;
   statusCode: number | null;
   durationMs: number;
   attempts: number;
   timedOut: boolean;
   error: string | null;
   createdAt?: Date;
   updatedAt?: Date;
};

export type IntegrationCallLogCreationAttributes = Optional<
   IntegrationCallLogAttributes,
   'id' | 'createdAt' | 'updatedAt'
>;

/** One row per outbound third party call, correlated to request_logs via requestId. */
export class IntegrationCallLogEntity
   extends Model<IntegrationCallLogAttributes, IntegrationCallLogCreationAttributes>
   implements IntegrationCallLogAttributes
{
   declare id: number;
   declare requestId: string | null;
   declare integration: string;
   declare method: string;
   declare url: string;
   declare statusCode: number | null;
   declare durationMs: number;
   declare attempts: number;
   declare timedOut: boolean;
   declare error: string | null;
   declare createdAt: Date;
   declare updatedAt: Date;
}

export const initIntegrationCallLogEntity = (sequelize: Sequelize) => {
   IntegrationCallLogEntity.init(
      {
         id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
         },
         requestId: {
            type: DataTypes.STRING(64),
            allowNull: true,
         },
         integration: {
            type: DataTypes.STRING(128),
            allowNull: false,
         },
         method: {
            type: DataTypes.STRING(16),
            allowNull: false,
         },
         url: {
            type: DataTypes.STRING(1024),
            allowNull: false,
         },
         statusCode: {
            type: DataTypes.INTEGER,
            allowNull: true,
         },
         durationMs: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
         },
         timedOut: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
         },
         error: {
            type: DataTypes.TEXT,
            allowNull: true,
         },
         createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
         },
         updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
         },
      },
      {
         sequelize,
         tableName: 'integration_call_logs',
         modelName: 'IntegrationCallLog',
         timestamps: true,
      },
   );

   return IntegrationCallLogEntity;
};
