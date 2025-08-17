import { GenderEnum } from 'src/Core/Shared/Enums/Gender.enum';

export interface IWorkerAdvanced {
   claim_id: number;
   claim_status: unknown;
   id: number;
   passport_number: string;
   passport_issued: string;
   passport_valid: string;
   citizenship_id: number;
   birthday_day: string;
   birthday_month: string;
   birthday_year: string;
   full_address: string;
   emplyee_status: unknown;
   first_name_am: string;
   first_name_en: string;
   last_name_am: string;
   last_name_en: string;
   patronymic_am: string;
   patronymic_en: string;
   email: string;
   ssn: string | null;
   telephone: string;
   gender_id: GenderEnum;
   user_created: string;
   country_arm: string;
   country_eng: string;
   path: string | null;
   serial_number: string;
   card_issued: string;
   card_valid: string;
   card_status: string;
}
