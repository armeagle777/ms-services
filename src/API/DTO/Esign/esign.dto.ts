import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEsignProfileDto {
   userData!: {
      first_name_en?: string;
      last_name_en?: string;
      ssn?: string;
      first_name_am?: string;
      last_name_am?: string;
      [key: string]: unknown;
   };
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
