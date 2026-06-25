import { Type } from 'class-transformer';
import {
   IsBoolean,
   IsIn,
   IsInt,
   IsNotEmpty,
   IsObject,
   IsOptional,
   IsString,
   Min,
   ValidateNested,
} from 'class-validator';

class CreateEsignUserDataDto {
   @IsString()
   @IsNotEmpty()
   firstNameEng!: string;

   @IsString()
   @IsNotEmpty()
   lastNameEng!: string;

   @IsString()
   @IsNotEmpty()
   ssn!: string;

   @IsString()
   @IsNotEmpty()
   firstName!: string;

   @IsString()
   @IsNotEmpty()
   lastName!: string;
}

export class CreateEsignProfileDto {
   @IsObject()
   @ValidateNested()
   @Type(() => CreateEsignUserDataDto)
   userData!: CreateEsignUserDataDto;

   @IsOptional()
   @IsBoolean()
   isRaCitizen?: boolean;
}

export class RevokeEsignProfileDto {
   @IsString()
   @IsNotEmpty()
   ssn!: string;

   @IsOptional()
   @IsInt()
   @Min(0)
   reasonCode?: number;

   @IsOptional()
   @IsInt()
   @IsIn([0, 1])
   deleteUser?: number;
}
