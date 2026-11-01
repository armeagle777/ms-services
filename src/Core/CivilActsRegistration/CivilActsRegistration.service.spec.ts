import { CivilActsRegistrationService } from './CivilActsRegistration.service';
import {
   CivilActDocument,
   CivilActsRegistrationResponse,
} from 'src/Infrustructure/Services/CivilActsRegistrationIntegration/CivilActsRegistration.types';

const document = (type: CivilActDocument['type'], childPsn?: string): CivilActDocument =>
   ({
      type,
      child: childPsn ? { psn: childPsn } : undefined,
   }) as CivilActDocument;

describe('CivilActsRegistrationService.getCivilActsInfoBySsnRaw', () => {
   it('returns only birth documents', async () => {
      const upstreamResponse: CivilActsRegistrationResponse = {
         status: 'ok',
         code: 'ecivil.200',
         result: {
            childBirth: document('birth', '2524240126'),
            paternity: document('paternity', '1111111111'),
            marriage: document('marriage'),
            divorce: document('divorce'),
            death: document('death'),
         },
      };
      const integration = {
         getCivilActsInfoBySsn: jest.fn().mockResolvedValue(upstreamResponse),
      };
      const service = new CivilActsRegistrationService(integration as never);

      const response = await service.getCivilActsInfoBySsnRaw('2701850401', 'first', 'last');

      expect(response.result).toEqual({
         childBirth: upstreamResponse.result.childBirth,
      });
   });
});
