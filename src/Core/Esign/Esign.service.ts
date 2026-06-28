import { Injectable } from '@nestjs/common';
import { CreateEsignProfileDto } from 'src/API/DTO/Esign/esign.dto';
import {
   PkiClientIntegration,
   RevokePkiUserRequest,
   RevokePkiUserResponse,
} from 'src/Infrustructure/Services/PkiClientIntegration/PkiClient.integration';

@Injectable()
export class EsignService {
   constructor(private readonly pkiClient: PkiClientIntegration) {}

   createProfile(request: CreateEsignProfileDto): Promise<{ password: string; data: string }> {
      return this.pkiClient.createUser({
         userData: {
            first_name_en: request.userData.firstNameEng,
            last_name_en: request.userData.lastNameEng,
            ssn: request.userData.ssn,
            first_name_am: request.userData.firstName,
            last_name_am: request.userData.lastName,
         },
         isRaCitizen: Boolean(request.isRaCitizen),
      });
   }

   async findProfile(ssn: string): Promise<unknown> {
      const response = await this.pkiClient.findUser(ssn);
      return this.pkiClient.parseFindUserResponse(response);
   }

   revokeProfile(request: RevokePkiUserRequest): Promise<RevokePkiUserResponse | string> {
      return this.pkiClient.revokeUser(request);
   }
}
