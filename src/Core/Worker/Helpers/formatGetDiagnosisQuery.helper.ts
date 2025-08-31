import { GetDiagnosis } from 'src/API/Validators/Person/GetDiagnosis.validator';
import { GetDiagnosisBaseQuery } from '../Queries/GetDiagnosisBaseQuery';

export const formatGetDiagnosisQuery = ({ ssn, cardSerial }: GetDiagnosis) => {
   let baseQuery = GetDiagnosisBaseQuery;
   const replacements: Record<string, any> = {};

   if (ssn) {
      baseQuery += ` AND all_cards.ssn = :ssn `;
      replacements.ssn = ssn;
   }

   if (cardSerial) {
      baseQuery += ` AND all_cards.serial_number = :cardSerial `;
      replacements.cardSerial = cardSerial;
   }
   baseQuery += ' ORDER BY all_cards.card_id;';
   return { query: baseQuery, replacements };
};
