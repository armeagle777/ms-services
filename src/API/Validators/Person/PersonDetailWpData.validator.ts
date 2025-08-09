import { IsInt, IsString, Min } from 'class-validator';
import { WorkerTbNamesEnum } from 'src/Core/Shared/Enums';

export class PersonDetailWpData {
   @IsString()
   tableName: WorkerTbNamesEnum;

   @IsInt()
   @Min(1)
   user_id: number;
}
