import { Transform, Type } from 'class-transformer';
import { IsInt, Min, ValidateNested, IsOptional, IsEnum, IsString } from 'class-validator';
import { GenderEnum } from 'src/Core/Shared/Enums/Gender.enum';

export class CountrySelect {
   @IsInt()
   value: number;

   @IsString()
   label: string;
}

export class Filters {
   @IsOptional()
   @IsString()
   document_number?: string;

   @IsOptional()
   @IsString()
   fisrt_name_arm?: string;

   @IsOptional()
   @IsString()
   last_name_arm?: string;

   @IsOptional()
   @IsString()
   psn?: string;

   @IsOptional()
   @IsString()
   fisrt_name_lat?: string;

   @IsOptional()
   @IsString()
   last_name_lat?: string;

   @IsOptional()
   @IsEnum(GenderEnum)
   select_gender?: GenderEnum;

   @IsOptional()
   @ValidateNested()
   @Type(() => CountrySelect)
   select_country?: CountrySelect;

   @IsOptional()
   @IsString()
   select_procedure?: string;

   @IsOptional()
   @IsString()
   birth_date_start?: string;

   @IsOptional()
   @IsString()
   birth_date_end?: string;
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

   @ValidateNested()
   @Type(() => Filters)
   filters: Filters;
}
