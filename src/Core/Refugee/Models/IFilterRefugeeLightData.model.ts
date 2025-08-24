import { IPaginationModel } from 'src/Core/Shared/Models';
import { IRefugeeLightDataModel } from './IRefugeeLigthData.model';

export interface IFilterRefugeeLightDataModel {
   data: Array<IRefugeeLightDataModel>;
   pagination: IPaginationModel;
}
