import { ApiProperty } from '@nestjs/swagger';

export class QkagInfoRequestDto {
   @ApiProperty()
   firstName!: string;

   @ApiProperty()
   lastName!: string;
}

export class QkagInfoBodyRequestDto {
   @ApiProperty()
   ssn!: string;

   @ApiProperty()
   first_name!: string;

   @ApiProperty()
   last_name!: string;
}
