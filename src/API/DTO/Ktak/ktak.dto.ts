import { IsNotEmpty, IsString } from 'class-validator';

export class KtakStudentsRequestDto {
   @IsString()
   @IsNotEmpty()
   pnum!: string;
}
