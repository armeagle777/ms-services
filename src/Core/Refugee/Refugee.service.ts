import { Injectable } from '@nestjs/common';

import { IPaginationParams } from '../Shared/Models';
import { RefugeeLightDataFilters } from 'src/API/Validators';

@Injectable()
export class RefugeeService {
   filterLightData(
      filters: RefugeeLightDataFilters,
      { pagination }: { pagination: IPaginationParams },
   ) {}

   getFullDataById(id: number) {}
}
