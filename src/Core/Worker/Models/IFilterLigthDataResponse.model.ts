import { IPaginationModel } from 'src/Core/Shared/Models/IPagination.model';
import { IWorkerLightDataModel } from './WorkerLightData.model';

export interface IFilterLightDataResponse {
   data: Array<IWorkerLightDataModel>;
   pagination: IPaginationModel;
}
