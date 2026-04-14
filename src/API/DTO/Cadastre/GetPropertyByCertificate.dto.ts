import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetPropertyByCertificateDto {
   @IsNotEmpty()
   certificateNumber: string;

   @IsOptional()
   searchBase?: string;
}
