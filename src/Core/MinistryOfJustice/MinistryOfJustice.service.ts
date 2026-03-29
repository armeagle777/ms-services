import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';
import { MojCesDebtorResponse } from 'src/Core/MinistryOfJustice/interfaces/moj-ces.interfaces';
import { MinistryOfJusticeIntegration } from 'src/Infrustructure/Services/MinistryOfJusticeIntegration/MinistryOfJustice.integration';

@Injectable()
export class MinistryOfJusticeService {
   constructor(
      private readonly httpService: HttpService,
      private readonly ministryOfJustice: MinistryOfJusticeIntegration,
   ) {}

   async getDebtorData(body: MojCesDebtorRequestDto): Promise<MojCesDebtorResponse[]> {
      const sanitizedProps = Object.fromEntries(
         Object.entries(body || {}).filter(([, v]) => Boolean(v)),
      );

      const options = this.ministryOfJustice.buildRequestOptions(
         '/get_debtor_info/v1',
         sanitizedProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      return response.data?.cer_get_debtor_response?.cer_get_debtor_inquests || [];
   }
}
