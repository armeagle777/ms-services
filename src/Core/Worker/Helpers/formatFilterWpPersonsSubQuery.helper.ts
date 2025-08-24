import { Filters } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { FilterWorkersBaseQuery } from '../Queries';

export const formatFilterWpPersonsSubQuery = (filters: Filters) => {
   const {
      psn,
      last_name_arm,
      select_gender,
      last_name_lat,
      fisrt_name_arm,
      fisrt_name_lat,
      select_country,
      birth_date_end,
      document_number,
      birth_date_start,
   } = { ...filters };

   let baseQuery = FilterWorkersBaseQuery;

   if (birth_date_start || birth_date_end) {
      let conditions = [];

      if (birth_date_start) {
         conditions.push(
            `STR_TO_DATE(CONCAT(birthday_day,'/',birthday_month,'/',birthday_year),'%d/%m/%Y') >= STR_TO_DATE('${birth_date_start}','%d/%m/%Y')`,
         );
      }

      if (birth_date_end) {
         conditions.push(
            `STR_TO_DATE(CONCAT(birthday_day,'/',birthday_month,'/',birthday_year),'%d/%m/%Y') <= STR_TO_DATE('${birth_date_end}','%d/%m/%Y')`,
         );
      }

      if (conditions.length) {
         baseQuery += ' AND ' + conditions.join(' AND ');
      }
   }

   if (fisrt_name_lat) {
      baseQuery += ` AND first_name_en LIKE '%${fisrt_name_lat}%'`;
   }

   if (last_name_lat) {
      baseQuery += ` AND last_name_en LIKE '%${last_name_lat}%'`;
   }

   if (fisrt_name_arm) {
      baseQuery += ` AND first_name_am LIKE '%${fisrt_name_arm}%'`;
   }

   if (last_name_arm) {
      baseQuery += ` AND last_name_am LIKE '%${last_name_arm}%'`;
   }

   if (psn) {
      baseQuery += ` AND ALL_PERSON.ssn = '${psn}'`;
   }

   if (document_number) {
      baseQuery += ` AND passport_number = '${document_number}'`;
   }

   if (select_gender) {
      baseQuery += ` AND gender_id = ${select_gender}`;
   }

   if (select_country?.value && select_country.value != 0) {
      baseQuery += ` AND citizenship_id = ${select_country.value}`;
   }
   return baseQuery;
};
