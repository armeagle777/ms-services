import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class IdValidator {
   @IsInt()
   @Min(0)
   @Transform(({ value }) => (value ? parseFloat(value) : value))
   id!: number;
}
