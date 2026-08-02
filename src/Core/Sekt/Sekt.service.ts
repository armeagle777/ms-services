import { Injectable, BadRequestException } from '@nestjs/common';
import { SektIntegration } from 'src/Infrustructure/Services/SektIntegration/Sekt.integration';
import { SektRequest } from 'src/Infrustructure/Services/SektIntegration/Models/sekt.types';
import { BordercrossResponse } from 'src/Core/Persons/interfaces/persons.interfaces';
import { ExtendedBordercrossResponse } from 'src/Core/Sekt/interfaces/sekt.interfaces';

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

   async getExtendedBordercrossInfo(
      passportNumber: string,
      citizenship: string,
   ): Promise<ExtendedBordercrossResponse> {
      if (!passportNumber || !citizenship) {
         throw new BadRequestException('Missing fields');
      }

      const request: SektRequest = {
         passportNumber,
         citizenship,
      };

      const jsonData = await this.sektIntegration.getExtendedBordercrossInfo(request);
      const data = jsonData?.data as
         | (ExtendedBordercrossResponse & { status?: string })
         | undefined;

      if (!data?.status || data.status !== 'ok') {
         return {};
      }

      const { crossingList, residencePermitList, documentNumberList, restrictedInfo } = data;
      return {
         crossingList,
         residencePermitList,
         documentNumberList,
         restrictedInfo,
      } as ExtendedBordercrossResponse;
   }
}
