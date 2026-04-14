import { IsOptional, IsString, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AgeRangeDto {
   @IsOptional()
   @IsNumber()
   min?: number | null;

   @IsOptional()
   @IsNumber()
   max?: number | null;
}

export class McsSearchPersonsDto {
   @IsOptional()
   @IsEnum(['BIRTH', 'LIVING'])
   addressType?: 'BIRTH' | 'LIVING';

   @IsOptional()
   @IsEnum(['EVER', 'CURRENT'])
   registrationType?: 'EVER' | 'CURRENT';

   @IsOptional()
   @IsString()
   firstName?: string;

   @IsOptional()
   @IsString()
   lastName?: string;

   @IsOptional()
   @IsString()
   patronomicName?: string;

   @IsOptional()
   @IsString()
   birthDate?: string;

   @IsOptional()
   @IsEnum(['exact', 'partial'])
   firstNameMatchType?: 'exact' | 'partial';

   @IsOptional()
   @IsEnum(['exact', 'partial'])
   lastNameMatchType?: 'exact' | 'partial';

   @IsOptional()
   @IsEnum(['exact', 'partial'])
   patronomicNameMatchType?: 'exact' | 'partial';

   @IsOptional()
   @IsString()
   region?: string;

   @IsOptional()
   @IsString()
   community?: string;

   @IsOptional()
   @IsString()
   residence?: string;

   @IsOptional()
   @IsString()
   street?: string;

   @IsOptional()
   @IsString()
   building?: string;

   @IsOptional()
   @IsString()
   apartment?: string;

   @IsOptional()
   @IsString()
   appartment?: string;

   @IsOptional()
   @ValidateNested()
   @Type(() => AgeRangeDto)
   age?: AgeRangeDto;

   @IsOptional()
   @IsEnum(['MALE', 'FEMALE', ''])
   gender?: 'MALE' | 'FEMALE' | '';
}
