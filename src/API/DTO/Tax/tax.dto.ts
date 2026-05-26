import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

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
   @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
      message: 'start_date must be in yyyy-mm-dd format',
   })
   start_date?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
      message: 'end_date must be in yyyy-mm-dd format',
   })
   end_date?: string;
}

export class GetTaxInfoBySsnDto {
   @IsString()
   @IsNotEmpty()
   ssn: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @Matches(/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
      message: 'start_date must be in dd.mm.yyyy format',
   })
   start_date?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   @Matches(/^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
      message: 'end_date must be in dd.mm.yyyy format',
   })
   end_date?: string;
}

export class GetTaxInfoByTinDto {
   @IsString()
   @IsNotEmpty()
   tin: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   endDate?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   startDate?: string;

   @IsOptional()
   @IsString()
   @IsNotEmpty()
   requestDate?: string;
}
