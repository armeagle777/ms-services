import { Injectable, BadRequestException } from '@nestjs/common';
import {
   SektIntegration,
   SektRequest,
} from 'src/Infrustructure/Services/SektIntegration/Sekt.integration';
import { BordercrossResponse } from 'src/Core/Persons/interfaces/persons.interfaces';

@Injectable()
export class SektService {
   constructor(private readonly sektIntegration: SektIntegration) {}

   async getBordercrossBySsn(
      passportNumber: string,
      citizenship: string,
   ): Promise<BordercrossResponse> {
      if (!passportNumber || !citizenship) {
         throw new BadRequestException('Missing fields');
      }

      const request: SektRequest = {
         passportNumber,
         citizenship,
      };

      const jsonData = await this.sektIntegration.getBordercrossBySsn(request);
      const data = jsonData?.data;

      if (!data?.status || data.status !== 'ok') {
         return {};
      }

      const { visaList, crossingList, residencePermitList } = data;
      return { visaList, crossingList, residencePermitList } as BordercrossResponse;
   }
}
