import { IsNotEmpty, IsString } from 'class-validator';

export class ExtendedBordercrossRequestDto {
   @IsString()
   @IsNotEmpty()
   passportNumber!: string;

   @IsString()
   @IsNotEmpty()
   citizenship!: string;
}
