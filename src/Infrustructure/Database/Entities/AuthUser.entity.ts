import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type AuthUserAttributes = {
   id: number;
   username: string;
   password: string;
   createdAt?: Date;
   updatedAt?: Date;
};

export type AuthUserCreationAttributes = Optional<
   AuthUserAttributes,
   'id' | 'createdAt' | 'updatedAt'
>;

export class AuthUserEntity
   extends Model<AuthUserAttributes, AuthUserCreationAttributes>
   implements AuthUserAttributes
{
   declare id: number;
   declare username: string;
   declare password: string;
   declare createdAt: Date;
   declare updatedAt: Date;
}

export const initAuthUserEntity = (sequelize: Sequelize) => {
   AuthUserEntity.init(
      {
         id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
         },
         username: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
         },
         password: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
         tableName: 'users',
         modelName: 'AuthUser',
         timestamps: true,
      },
   );

   return AuthUserEntity;
};
