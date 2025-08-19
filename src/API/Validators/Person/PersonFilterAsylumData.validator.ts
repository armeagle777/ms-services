import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CountrySelect {
   value: number;
   label: string;
}

export class Filters {
   //    card_id: string;
   //    document_number: string;
   //    fisrt_name_arm: string;
   //    last_name_arm: string;
   //    psn: string;
   //    fisrt_name_lat: string;
   //    last_name_lat: string;
   //    select_gender: string;
   //    select_country: CountrySelect;
   //    select_procedure: string;
   //    created_at_start: string;
   //    created_at_end: string;
   //    birth_date_start: string;
   //    birth_date_end: string;
}

export class PersonFilterWpDataValidator {
   @IsInt()
   @Min(1)
   @Transform(({ value }) => (value ? parseFloat(value) : value))
   page: number = 1;

   @IsInt()
   @Min(1)
   @Transform(({ value }) => (value ? parseFloat(value) : value))
   pageSize: number = 10;

   filters: Filters;
}
