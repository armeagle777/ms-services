import { ApiProperty } from '@nestjs/swagger';

export class QkagInfoRequestDto {
   @ApiProperty()
   ssn!: string;

   @ApiProperty()
   first_name!: string;

   @ApiProperty()
   last_name!: string;
}
