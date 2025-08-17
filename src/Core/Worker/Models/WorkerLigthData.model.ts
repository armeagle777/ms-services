import { WorkerTbNamesEnum } from 'src/Core/Shared/Enums';
import { GenderEnum } from 'src/Core/Shared/Enums/Gender.enum';

export interface WorkerLigthDataModel {
   id: number;
   ssn: string;
   alpha_3: string;
   user_id: number;
   claim_id: number;
   REG_DATE: string;
   arm_short: string;
   issue_date: string;
   EMP_STATUS: string;
   claim_date: string;
   expire_date: string;
   card_status: string;
   last_name_en: string;
   claim_status: string;
   birthday_day: string;
   first_name_en: string;
   serial_number: string;
   gender_id: GenderEnum;
   birthday_year: string;
   citizenship_id: number;
   birthday_month: string;
   passport_number: string;
   fine_status: string | null;
   tablename: WorkerTbNamesEnum;
}
