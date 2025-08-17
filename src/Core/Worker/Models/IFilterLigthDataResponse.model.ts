import { IPaginationModel } from 'src/Core/Shared/Models/IPagination.model';

export interface IFilterLightDataResponse {
   data: Array<IFilterLightDataResponse>;
   pagination: IPaginationModel;
}
