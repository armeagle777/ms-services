import { WorkerTbNamesEnum } from 'src/Core/Shared/Enums';
import { IWorkerAdvanced } from './IWorkerAdvanced.model';

export type IWorkerLightDataModel = Pick<
   IWorkerAdvanced,
   | 'id'
   | 'passport_number'
   | 'citizenship_id'
   | 'birthday_day'
   | 'birthday_month'
   | 'birthday_year'
   | 'first_name_en'
   | 'last_name_en'
   | 'gender_id'
   | 'ssn'
   | 'path'
> & {
   alpha_3: string;
   user_id: number;
   arm_short: string;
   EMP_STATUS: string;
   tablename: WorkerTbNamesEnum;
};
