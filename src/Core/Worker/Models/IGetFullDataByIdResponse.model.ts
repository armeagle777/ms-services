import { IWorkerAdvanced } from './IWorkerAdvanced.model';
import { IWorkerFine } from './IWorkerFine.model';

export interface IGetFullDataByIdResponse {
   fines: IWorkerFine[];
   cards: any;
   claims: any;
   familyMembers: any;
   baseInfo: IWorkerAdvanced;
}
