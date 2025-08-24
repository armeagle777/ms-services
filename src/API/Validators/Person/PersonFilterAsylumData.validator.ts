import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { GenderEnum } from 'src/Core/Shared/Enums/Gender.enum';

export class AutoCompleteOption {
   value: number;
   label: string;
}

export class RefugeeLightDataFilters {
   @IsOptional()
   @IsString()
   doc_num?: string;

   @IsOptional()
   @IsString()
   f_name_arm?: string;

   @IsOptional()
   @IsString()
   l_name_arm?: string;

   @IsOptional()
   @IsString()
   f_name_eng?: string;

   @IsOptional()
   @IsString()
   l_name_eng?: string;

   @IsInt()
   select_gender: GenderEnum;

   @IsOptional()
   @ValidateNested()
   @Type(() => AutoCompleteOption)
   select_etnicity?: AutoCompleteOption | null;

   @IsOptional()
   @ValidateNested()
   @Type(() => AutoCompleteOption)
   select_country?: AutoCompleteOption | null;

   @IsOptional()
   @IsString()
   birth_date_start?: string;

   @IsOptional()
   @IsString()
   birth_date_end?: string;
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

   @ValidateNested()
   @Type(() => RefugeeLightDataFilters)
   filters: RefugeeLightDataFilters;
}
