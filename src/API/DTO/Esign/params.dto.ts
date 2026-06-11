import { IsNotEmpty, IsString } from 'class-validator';

export class SsnParamDto {
   @IsString()
   @IsNotEmpty()
   ssn!: string;
}
