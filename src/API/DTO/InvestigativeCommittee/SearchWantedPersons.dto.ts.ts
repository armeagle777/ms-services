import { IsOptional } from 'class-validator';

export class SearchWantedPersonsDto {
   @IsOptional()
   pnum?: string;

   @IsOptional()
   firstName?: string;

   @IsOptional()
   lastName?: string;

   @IsOptional()
   birthDate?: string;
}
