import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export const AsylumDbProvider = {
   provide: 'ASYLUM_CONNECTION',
   imports: [],
   inject: [],
   useFactory: async () => {
      const config: SequelizeOptions = {
         logging: false,
         dialect: 'mysql',
         host: process.env.DATABASE_HOST_ASYLUM,
         port: Number(process.env.DATABASE_PORT_ASYLUM),
         database: process.env.DATABASE_NAME_ASYLUM,
         username: process.env.DATABASE_USERNAME_ASYLUM,
         password: process.env.DATABASE_USER_PASSWORD_ASYLUM,
      };
      const sequelize = new Sequelize(config);
      await sequelize.authenticate();
      return sequelize;
   },
};
