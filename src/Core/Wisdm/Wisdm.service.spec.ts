import { BadRequestException } from '@nestjs/common';

import type { WisdmCreateRecordDto, WisdmUpdateRecordDto } from 'src/API/DTO/Interpol/wisdm.dto';
import { WisdmService } from './Wisdm.service';

const successfulMutation = {
   ok: true,
   httpStatus: 200,
   fault: null,
   resultCode: 'NO_ERROR',
   resultOtherCode: null,
   requestId: null,
   referenceInCountry: null,
   timestamp: null,
   upstreamMessage: null,
   resultCodeMeta: {
      key: 'NO_ERROR',
      numericValue: 0,
      isKnown: true,
      description: 'No error',
      retryable: false,
      requiresQueryRefinement: false,
      accessDenied: false,
   },
   functionalError: null,
   din: 'AB123',
   typeOfDocument: 'P',
   recordRetentionDate: null,
   xmlData: null,
};

const createService = () => {
   const integration = {
      createRecord: jest.fn().mockResolvedValue(successfulMutation),
      updateRecord: jest.fn().mockResolvedValue(successfulMutation),
      clearAllRecords: jest.fn().mockResolvedValue({ ok: true }),
   };

   return {
      integration,
      service: new WisdmService(integration as never),
   };
};

describe('WisdmService request normalization', () => {
   it('cleans the DIN, uppercases the document type, and preserves Unicode free text', async () => {
      const { integration, service } = createService();

      await service.createRecord({
         din: ' ab-123 ',
         typeOfDocument: 'p',
         fraudType: 'THEFT_CODE',
         additionalInformation: '  Կորած փաստաթուղթ  ',
      } as WisdmCreateRecordDto);

      expect(integration.createRecord).toHaveBeenCalledWith(
         expect.objectContaining({
            din: 'AB123',
            typeOfDocument: 'P',
            fraudType: 'THEFT_CODE',
            additionalInformation: 'Կորած փաստաթուղթ',
         }),
      );
   });

   it('preserves an explicit empty update value so WISDM can clear the field', async () => {
      const { integration, service } = createService();

      await service.updateRecord({
         din: 'AB123',
         typeOfDocument: 'P',
         additionalInformation: '',
      } as WisdmUpdateRecordDto);

      expect(integration.updateRecord).toHaveBeenCalledWith(
         expect.objectContaining({ additionalInformation: '' }),
      );
   });

   it('requires an extension reason when a normal update changes the retention date', async () => {
      const { integration, service } = createService();

      await expect(
         service.updateRecord({
            din: 'AB123',
            typeOfDocument: 'P',
            recordRetentionDate: '20270101',
         } as WisdmUpdateRecordDto),
      ).rejects.toThrow(
         new BadRequestException(
            'extensionReason is required when recordRetentionDate is changed.',
         ),
      );
      expect(integration.updateRecord).not.toHaveBeenCalled();
   });

   it('requires explicit confirmation before calling the destructive Clear operation', async () => {
      const { integration, service } = createService();

      await expect(service.clearAllRecords(false)).rejects.toThrow(BadRequestException);
      expect(integration.clearAllRecords).not.toHaveBeenCalled();

      await service.clearAllRecords(true);
      expect(integration.clearAllRecords).toHaveBeenCalledTimes(1);
   });
});
