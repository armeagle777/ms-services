import { Filters } from 'src/API/Validators/Person/PersonFilterWpData.validator';
import { FilterWorkersBaseQuery } from '../Queries';
import { convertToMysqlDate } from './convertToMysqlDate.helper';

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
      select_procedure,
   } = { ...filters };

   let baseQuery = FilterWorkersBaseQuery;

   if (birth_date_start && !birth_date_end) {
      const bDayArray = birth_date_start.split('/');

      const birth_date_start_day = bDayArray[0];
      const birth_date_start_month = bDayArray[1];
      const birth_date_start_year = bDayArray[2];
      baseQuery += ` AND birthday_day = '${birth_date_start_day}' AND birthday_month =  '${birth_date_start_month}' AND birthday_year = '${birth_date_start_year}' `;
   }

   if (birth_date_start && birth_date_end) {
      const bDayStartArray = birth_date_start.split('/');
      const bDayEndArray = birth_date_end.split('/');

      const bDate_start_day = bDayStartArray[0];
      const bDate_start_month = bDayStartArray[1];
      const bDate_start_year = bDayStartArray[2];
      const formatedBDayStart = `${bDate_start_year}-${bDate_start_month}-${bDate_start_day}`;
      const birth_date_start_day = bDayStartArray[0];

      const birth_date_end_day = bDayEndArray[0];
      const birth_date_end_month = bDayEndArray[1];
      const birth_date_end_year = bDayEndArray[2];
      const formatedBDayEnd = `${birth_date_end_year}-${birth_date_end_month}-${birth_date_end_day}`;

      baseQuery += ` AND CONCAT(birthday_year,'-', birthday_month,'-', birthday_day) >= '${formatedBDayStart}' and
    CONCAT(ALL_PERSON.birthday_year,'-', ALL_PERSON.birthday_month,'-', ALL_PERSON.birthday_day) <=  '${formatedBDayEnd}' `;
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
      baseQuery += ` AND ssn = '${psn}'`;
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
