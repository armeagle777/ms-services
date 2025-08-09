import { WorkerTbNamesEnum } from 'src/Core/Shared/Enums';

export interface IGetFullDataByIdProps {
   id: number;
   tableName: WorkerTbNamesEnum;
   user_id: number;
}
