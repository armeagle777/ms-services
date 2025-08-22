import { IEatm } from './IEatm.model';
import { IEatmFamily } from './IEatmFamily.model';
import { IWorkerCard } from './IWorkerCard.model';
import { IWp } from './IWp.model';

export interface IGetFullDataByPnumResponse {
   wpData: Omit<IWp, keyof IWorkerCard>[] | null;
   eatmData: Omit<IEatm, keyof IWorkerCard>[] | null;
   eatmFamilyData: Omit<IEatmFamily, keyof IWorkerCard>[] | null;
   cards: IWorkerCard[];
}
