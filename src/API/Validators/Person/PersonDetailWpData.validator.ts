import { IsInt, IsString, Min } from 'class-validator';
import { WpTableNamesEnum } from 'src/Core/Shared/Enums';

export class PersonDetailWpData {
   @IsString()
   tablename: WpTableNamesEnum;

   @IsInt()
   @Min(1)
   user_id: number;
}
