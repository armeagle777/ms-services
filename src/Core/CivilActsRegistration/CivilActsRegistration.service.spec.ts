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
   it('returns only child birth records and non-duplicated paternity records', async () => {
      const upstreamResponse: CivilActsRegistrationResponse = {
         status: 'ok',
         code: 'ecivil.200',
         result: {
            marriage: document('marriage'),
            searchedPersonsBirth: document('birth', '2701850401'),
            childBirth: document('birth', '2524240126'),
            duplicatedPaternity: document('paternity', '2524240126'),
            paternityOnly: document('paternity', '1111111111'),
         },
      };
      const integration = {
         getCivilActsInfoBySsn: jest.fn().mockResolvedValue(upstreamResponse),
      };
      const service = new CivilActsRegistrationService(integration as never);

      const response = await service.getCivilActsInfoBySsnRaw('2701850401', 'ՏԻԳՐԱՆ', 'ԵՐԱՆՅԱՆ');

      expect(response).toEqual({
         status: 'ok',
         code: 'ecivil.200',
         result: {
            childBirth: upstreamResponse.result.childBirth,
            paternityOnly: upstreamResponse.result.paternityOnly,
         },
      });
   });

   it('keeps a paternity record when its child has no birth record in the response', async () => {
      const upstreamResponse: CivilActsRegistrationResponse = {
         status: 'ok',
         code: 'ecivil.200',
         result: {
            paternity: document('paternity', '2524240126'),
         },
      };
      const integration = {
         getCivilActsInfoBySsn: jest.fn().mockResolvedValue(upstreamResponse),
      };
      const service = new CivilActsRegistrationService(integration as never);

      const response = await service.getCivilActsInfoBySsnRaw('2701850401', 'first', 'last');

      expect(response.result).toEqual(upstreamResponse.result);
   });
});
