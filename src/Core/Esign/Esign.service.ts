import { Injectable } from '@nestjs/common';
import {
   PkiClientIntegration,
   RevokePkiUserRequest,
} from 'src/Infrustructure/Services/PkiClientIntegration/PkiClient.integration';

@Injectable()
export class EsignService {
   constructor(private readonly pkiClient: PkiClientIntegration) {}

   revokeProfile(request: RevokePkiUserRequest): Promise<string> {
      return this.pkiClient.revokeUser(request);
   }
}
