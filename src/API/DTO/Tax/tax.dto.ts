import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CompanyObligationsQueryDto {
   startDate?: string;
   endDate?: string;
}

export class TaxSsnRequestDto {
   @IsString()
   @IsNotEmpty()
   ssn: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   start_date?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   end_date?: string;
}
