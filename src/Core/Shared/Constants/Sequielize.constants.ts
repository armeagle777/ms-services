import { QueryOptionsWithType, QueryTypes } from 'sequelize';

export const SequelizeSelectOptions: QueryOptionsWithType<QueryTypes.SELECT> = {
   type: QueryTypes.SELECT,
};
