export interface IPaginationModel {
   total: number;
   page: number;
   pageSize: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}
