import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

export const WorkPermitDbProvider = {
   provide: 'WORKPERMIT_CONNECTION',
   imports: [],
   inject: [],
   useFactory: async () => {
      const config: SequelizeOptions = {
         logging: false,
         dialect: 'mysql',
         host: process.env.DATABASE_HOST_WP,
         port: Number(process.env.DATABASE_PORT_WP),
         database: process.env.DATABASE_NAME_WP,
         username: process.env.DATABASE_USERNAME_WP,
         password: process.env.DATABASE_USER_PASSWORD_WP,
         dialectOptions: {
            connectTimeout: 10000,
         },
         retry: {
            max: 5,
         },
      };
      const sequelize = new Sequelize(config);
      await sequelize.authenticate();
      return sequelize;
   },
};
