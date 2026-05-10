import { IsOptional } from 'class-validator';

export class McsAddressQueryDto {
   @IsOptional()
   region?: string;

   @IsOptional()
   community?: string;

   @IsOptional()
   residence?: string;
}
