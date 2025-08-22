import { IWorkerAdvanced } from '../Models';

//TODO Create type for baseInfo
export const formatBaseInfoResult = (
   baseInfo: IWorkerAdvanced[] | null | undefined,
): IWorkerAdvanced | null => {
   if (!baseInfo) return null;
   const data = baseInfo[0];
   return data;
};
