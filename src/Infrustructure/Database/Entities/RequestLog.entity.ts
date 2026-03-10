import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type RequestLogAttributes = {
   id: number;
   username: string | null;
   method: string;
   path: string;
   statusCode: number;
   ip: string | null;
   body: string | null;
   query: string | null;
   error: string | null;
   createdAt?: Date;
   updatedAt?: Date;
};

export type RequestLogCreationAttributes = Optional<
   RequestLogAttributes,
   'id' | 'createdAt' | 'updatedAt'
>;

export class RequestLogEntity
   extends Model<RequestLogAttributes, RequestLogCreationAttributes>
   implements RequestLogAttributes
{
   declare id: number;
   declare username: string | null;
   declare method: string;
   declare path: string;
   declare statusCode: number;
   declare ip: string | null;
   declare body: string | null;
   declare query: string | null;
   declare error: string | null;
   declare createdAt: Date;
   declare updatedAt: Date;
}

export const initRequestLogEntity = (sequelize: Sequelize) => {
   RequestLogEntity.init(
      {
         id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
         },
         username: {
            type: DataTypes.STRING(255),
            allowNull: true,
         },
         method: {
            type: DataTypes.STRING(16),
            allowNull: false,
         },
         path: {
            type: DataTypes.STRING(1024),
            allowNull: false,
         },
         statusCode: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         ip: {
            type: DataTypes.STRING(64),
            allowNull: true,
         },
         body: {
            type: DataTypes.TEXT,
            allowNull: true,
         },
         query: {
            type: DataTypes.TEXT,
            allowNull: true,
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
         tableName: 'request_logs',
         modelName: 'RequestLog',
         timestamps: true,
      },
   );

   return RequestLogEntity;
};
