import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { MojCesDebtorRequestDto } from 'src/API/DTO/MojCes/moj-ces.dto';
import { MojCesDebtorResponse } from 'src/Core/MinistryOfJustice/interfaces/moj-ces.interfaces';
import { EkengCertClientIntegration } from 'src/Infrustructure/Services/EkengCertClientIntegration/EkengCertClient.integration';

@Injectable()
export class MinistryOfJusticeService {
   constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
      private readonly ekeng: EkengCertClientIntegration,
   ) {}

   async getDebtorData(body: MojCesDebtorRequestDto): Promise<MojCesDebtorResponse[]> {
      const apiUrl = this.configService.get<string>('MOJ_CES_API_URL');
      if (!apiUrl) throw new InternalServerErrorException('MOJ_CES_API_URL is not configured');

      const sanitizedProps = Object.fromEntries(
         Object.entries(body || {}).filter(([_, v]) => Boolean(v)),
      );

      const options = this.ekeng.buildRequestOptions(
         `${apiUrl}/get_debtor_info/v1`,
         sanitizedProps,
      );

      const response = await firstValueFrom(this.httpService.request(options));
      return response.data?.cer_get_debtor_response?.cer_get_debtor_inquests || [];
   }
}
