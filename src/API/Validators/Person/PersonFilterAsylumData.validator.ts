import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class AsylumCountrySelect {
   value: number;
   label: string;
}

export class RefugeeLightDataFilters {
   card_number: string;
   document_number: string;
   fisrt_name_arm: string;
   last_name_arm: string;
   fisrt_name_lat: string;
   last_name_lat: string;
   select_gender: string;
   select_country: AsylumCountrySelect;
   birth_date_start: string;
   birth_date_end: string;
}

export class PersonFilterAsylumDataValidator {
   @IsInt()
   @Min(1)
   @Transform(({ value }) => (value ? parseFloat(value) : value))
   page: number = 1;

   @IsInt()
   @Min(1)
   @Transform(({ value }) => (value ? parseFloat(value) : value))
   pageSize: number = 10;

   filters: RefugeeLightDataFilters;
}
