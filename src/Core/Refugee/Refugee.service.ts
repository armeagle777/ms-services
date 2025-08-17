import { Injectable } from '@nestjs/common';

import { IPagination } from '../Shared/Models';
import { RefugeeLightDataFilters } from 'src/API/Validators';

@Injectable()
export class RefugeeService {
   filterLightData(filters: RefugeeLightDataFilters, { pagination }: { pagination: IPagination }) {}

   getFullDataById(id: number) {}
}
