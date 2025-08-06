import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class PersonWpDataValidator {
   @IsString()
   @Length(9, 10)
   @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
   pnum!: string;
}
