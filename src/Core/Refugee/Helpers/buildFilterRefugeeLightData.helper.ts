import { RefugeeLightDataFilters } from 'src/API/Validators';
import { FilterRefugeeBaseQuery } from '../Queries/FilterRefugeeBaseQuery';

export const buildFilterRefugeeLightDataQuery = (filters: RefugeeLightDataFilters) => {
   const {
      doc_num,
      f_name_arm,
      l_name_arm,
      f_name_eng,
      l_name_eng,
      select_gender,
      select_etnicity,
      select_country,
      birth_date_start,
      birth_date_end,
   } = { ...filters };

   let baseQuery = FilterRefugeeBaseQuery;

   if (birth_date_start || birth_date_end) {
      let conditions = [];

      if (birth_date_start) {
         conditions.push(
            `STR_TO_DATE(CONCAT(b_day,'/',b_month,'/',b_year),'%d/%m/%Y') >= STR_TO_DATE('${birth_date_start}','%d/%m/%Y')`,
         );
      }

      if (birth_date_end) {
         conditions.push(
            `STR_TO_DATE(CONCAT(b_day,'/',b_month,'/',b_year),'%d/%m/%Y') <= STR_TO_DATE('${birth_date_end}','%d/%m/%Y')`,
         );
      }

      if (conditions.length) {
         baseQuery += ' AND ' + conditions.join(' AND ');
      }
   }

   if (f_name_eng) {
      baseQuery += ` AND P.f_name_eng LIKE '%${f_name_eng}%'`;
   }

   if (l_name_eng) {
      baseQuery += ` AND P.l_name_eng LIKE '%${l_name_eng}%'`;
   }

   if (f_name_arm) {
      baseQuery += ` AND P.f_name_arm LIKE '%${f_name_arm}%'`;
   }

   if (l_name_arm) {
      baseQuery += ` AND P.l_name_arm LIKE '%${l_name_arm}%'`;
   }

   if (doc_num) {
      baseQuery += ` AND P.doc_num = '${doc_num}'`;
   }

   if (select_gender) {
      baseQuery += ` AND P.sex = ${select_gender}`;
   }

   if (select_country?.value && select_country.value != 0) {
      baseQuery += ` AND P.citizenship = ${select_country.value}`;
   }

   if (select_etnicity?.value && select_etnicity.value != 0) {
      baseQuery += ` AND P.etnicity = ${select_country.value}`;
   }

   baseQuery += ' ORDER BY P.personal_id ASC ';
   return baseQuery;
};
