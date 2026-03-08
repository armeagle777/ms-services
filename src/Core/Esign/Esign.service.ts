import { BadRequestException, Injectable } from '@nestjs/common';

import { parseFindUserResponse } from 'src/Core/Esign/esign.helpers';
import { PkiClientService } from 'src/Infrustructure/Services/ESignIntegration/PkiClient.service';
import { CreateEsignProfileDto, RevokeEsignProfileDto } from 'src/API/DTO/Esign/esign.dto';
import {
   EsignEditUserResponse,
   EsignFindUserResponse,
   EsignRevokeResponse,
} from 'src/Core/Esign/interfaces/esign.interfaces';

@Injectable()
export class EsignService {
   constructor(private readonly pkiClient: PkiClientService) {}

   async getESignDataBySsn(ssn: string): Promise<EsignFindUserResponse> {
      const result = await this.pkiClient.findUser(ssn);
      return parseFindUserResponse(result) as EsignFindUserResponse;
   }

   async createESignProfile(body: CreateEsignProfileDto): Promise<EsignEditUserResponse> {
      const { userData, isRaCitizen } = body || {};
      const requiredFields = [
         'first_name_en',
         'last_name_en',
         'ssn',
         'first_name_am',
         'last_name_am',
      ];
      const missing = requiredFields.filter((field) => !userData?.[field]);

      if (missing.length) {
         throw new BadRequestException('Missing fields');
      }

      return this.pkiClient.editUser(userData, { isRaCitizen: Boolean(isRaCitizen) });
   }

   async revokeESignProfile(body: RevokeEsignProfileDto): Promise<EsignRevokeResponse> {
      const { ssn, reasonCode = 0, deleteUser = 1 } = body || {};

      if (!ssn) {
         throw new BadRequestException('Missing fields');
      }

      const FAKE_SSN = '999999';
      return this.pkiClient.revokeUser(FAKE_SSN, { reasonCode, deleteUser });
   }
}
