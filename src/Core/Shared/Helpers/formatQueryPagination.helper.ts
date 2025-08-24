import { IPaginationParams } from '../Models';

export const formatQueryPagination = (
   pagination: IPaginationParams,
): { limit: number; offset: number; page: number; pageSize: number } => {
   const { page, pageSize } = pagination;
   const offset = (page - 1) * pageSize;
   const limit = pageSize;

   return { limit, offset, page, pageSize };
};
