import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { ARTSAKH_CONNECTION } from '../database.tokens';

export const ArtsakhDbProvider = {
   provide: ARTSAKH_CONNECTION,
   imports: [],
   inject: [],
   useFactory: async () => {
      const config: SequelizeOptions = {
         logging: false,
         dialect: 'mysql',
         host: process.env.ARTSAKH_DATABASE_HOST,
         port: Number(process.env.ARTSAKH_DATABASE_PORT),
         database: process.env.ARTSAKH_DATABASE_NAME,
         username: process.env.ARTSAKH_DATABASE_USERNAME,
         password: process.env.ARTSAKH_DATABASE_USER_PASSWORD,
      };
      const sequelize = new Sequelize(config);
      await sequelize.authenticate();
      return sequelize;
   },
};
