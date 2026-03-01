import { TABLE_NAMES } from './wp.constants';

const getWpQuery = (pnum) => `SELECT
                    a.ssn,
                    b.id AS employee_id,
                    c.id AS claim_id,
                    c.created_at,
                    c.status,
                    c.type as claim_type,
                    log.created_at as decision_date,
                    log.action,
                    log.type,
                    d.serial_number,
                    d.issue_date,
                    d.expire_date,
                    d.printed_at,
                    d.status as card_status,
                    d.transferred_at,
                    d.created_at,
                    e.type as vacancy_type,
                    e.company_id,
                    h.tin,
                    h.name,
                    h.email as company_email,
                    h.telephone as company_tel,
                    e.position_code_id,
                    g.name_am,
                    a.email as user_email,
                    a.telephone as user_tel,
                    image.path as photo_path
                FROM
                    users a
                        INNER JOIN
                    employees b ON a.id = b.user_id
                        INNER JOIN
                    claims c ON b.id = c.employee_id
                left join
                (select * from ms_logs f where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as log on log.claim_id = c.id
                left join
                ms_cards d on d.claim_id = c.id
                inner join
                vacancies e on c.vacancy_id = e.id
                INNER join
                position_codes g on e.position_code_id = g.id
                inner join
                companies h on e.company_id = h.id
                left join (select path, claim_id from claim_files p where p.active = 1 and p.type = 'photo') as image on image.claim_id = c.id
                WHERE
                    a.ssn ="${pnum}" 
                    and c.status != 'pending_foreigner'`;

const getEatmQuery = (pnum) => `SELECT
                        a.id as user_id,
                        a.ssn,
                        a.first_name_am ,
                        a.last_name_am,
                        a.patronymic_am,
                        a.first_name_en,
                        a.last_name_en,
                        a.patronymic_en,
                        b.id AS eaeu_employee_id,
                        c.id AS claim_id,
                        c.created_at,
                        c.status,
                        c.type as claim_type,
                        b.actual_address as filled_in_address,
                        b.agreement_start_date,
                        b.agreement_end_date,
                        b.passport_number,
                        b.passport_issued,
                        b.passport_valid,
                        log.created_at as decision_date,
                        log.action,
                        log.type,
                        d.serial_number,
                        d.issue_date,
                        d.expire_date,
                        d.printed_at,
                        d.status as card_status,
                        d.transferred_at,
                        d.created_at,
                        a.email as user_email,
                        a.telephone as user_tel,
                        image.path as photo_path
                    FROM
                        users a
                    INNER JOIN eaeu_employees b ON a.id = b.user_id
                    INNER JOIN claims c ON b.id = c.eaeu_employee_id
                    LEFT JOIN (select * from ms_logs f where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as log on log.claim_id = c.id
                    LEFT JOIN ms_cards d on d.claim_id = c.id
                    LEFT JOIN (select path, claim_id from claim_files p where p.active = 1 and p.type = 'photo') as image on image.claim_id = c.id
                    WHERE
                        a.ssn='${pnum}' `;

const getEatmFamilyMemberQuery = (pnum) => `SELECT
                        a.user_id as applicant_user_id,
                        a.ssn as family_member_ssn,
                        a.id as eaeu_employee_family_member_id,
                        a.first_name_am as family_member_first_name_am,
                        a.last_name_am as family_member_last_name_am,
                        a.patronymic_am as family_member_patronymic_am,
                        a.first_name_en as family_member_first_name_en,
                        a.last_name_en as family_member_last_name_en,
                        a.patronymic_en as family_member_patronymic_en,
                        a.passport_number as family_member_passport,
                        a.passport_issued as family_member_passport_issued,
                        a.passport_valid as family_member_passport_valid,
                        a.email as family_member_email,
                        a.telephone as family_member_tel,
                        a.gender_id,
                        a.family_member_id,
                        concat(a.birthday_day, '.', a.birthday_month, '.', a.birthday_year) as family_member_bday,
                        d.name_am as family_member_citizenship,
                        d.alpha_3 as family_member_citizenship_alpha_3,
                        b.id as claim_id,
                        b.created_at as claim_date,
                        b.status as claim_status,
                        b.type as claim_type,
                        log.created_at as decision_date,
                        log.action,
                        log.type,
                        e.serial_number as family_member_card,
                        e.issue_date as family_member_card_issue_date,
                        e.expire_date as family_member_card_expire_date,
                        c.ssn as applicant_ssn,
                        c.first_name_am as applicant_first_name_am,
                        c.last_name_am as applicant_last_name_am,
                        c.first_name_en as applicant_first_name_en,
                        c.last_name_en as applicant_last_name_em,
                        image.path as photo_path
                        from eaeu_employee_family_members a
                        inner join claims b on a.id = b.eaeu_employee_family_member_id
                        inner join users c on a.user_id = c.id
                        inner join countries d on a.citizenship_id = d.id
                        left join
                        (select * from ms_logs f where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as log on log.claim_id = b.id
                        left join
                        ms_cards e on b.id = e.claim_id
                        left join (select path, claim_id from claim_files p where p.active = 1 and p.type = 'photo') as image on image.claim_id = b.id
                        WHERE a.ssn="${pnum}"`;

const extractData = (row) => {
  const cards = [];
  const data = row?.map((row) => {
    const {
      serial_number,
      issue_date,
      expire_date,
      printed_at,
      card_status,
      transferred_at,
      ...rowData
    } = row;
    if (serial_number) {
      cards.push({
        serial_number,
        issue_date,
        expire_date,
        printed_at,
        card_status,
        transferred_at,
      });
    }
    return rowData;
  });

  return { cards, data: data ?? null };
};

function convertToMysqlDate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

const filterWpPersonsQuery = (filters) => {
  const {
    card_id,
    document_number,
    fisrt_name_arm,
    last_name_arm,
    psn,
    fisrt_name_lat,
    last_name_lat,
    select_gender,
    select_country,
    select_procedure,
    select_card_status,
    select_claim_status,
    created_at_start,
    created_at_end,
    birth_date_start,
    birth_date_end,
  } = filters;
  let baseQuery = `SELECT ALL_PERSON.tablename, ALL_PERSON.id, ALL_PERSON.passport_number, ALL_PERSON.citizenship_id, ALL_PERSON.ssn, ALL_PERSON.alpha_3, ALL_PERSON.arm_short, ALL_PERSON.first_name_en, ALL_PERSON.last_name_en,ALL_PERSON.serial_number, ALL_PERSON.issue_date, ALL_PERSON.expire_date, ALL_PERSON.card_status, 
	ALL_PERSON.gender_id, ALL_PERSON.claim_id, ALL_PERSON.user_id, ALL_PERSON.REG_DATE, ALL_PERSON.card_status, ALL_PERSON.EMP_STATUS, ALL_PERSON.claim_date,
	ALL_PERSON.claim_status, ALL_PERSON.birthday_day, ALL_PERSON.birthday_month, ALL_PERSON.birthday_year, ALL_PERSON.fine_status
   
   FROM (
   
   SELECT 
	 a.birthday_day, a.birthday_month, a.birthday_year, e.status as claim_status, DATE(e.created_at) as claim_date, a.id, a.passport_number, a.citizenship_id, c.alpha_3, c.arm_short, DATE(e.created_at) AS REG_DATE, a.status AS EMP_STATUS, b.first_name_am, b.last_name_am, b.first_name_en, b.last_name_en, b.ssn, d.claim_id, d.serial_number, d.status as card_status, d.issue_date, d.expire_date, 'Employee' as tablename, b.gender_id, a.user_id, f.status as fine_status
   FROM
	   employees a
		   INNER JOIN
	   users b ON a.user_id = b.id
		   INNER JOIN
	   countries c ON a.citizenship_id = c.id
			  INNER JOIN 
	   claims e ON a.id = e.employee_id
		   LEFT JOIN
	   ms_cards d ON e.id = d.claim_id
		   LEFT JOIN
	   fines f ON a.id = f.employee_id
		   
   UNION    
   SELECT 
   a.birthday_day, a.birthday_month, a.birthday_year,  e.status as claim_status, DATE(e.created_at) as claim_date, a.id, a.passport_number, a.citizenship_id, c.alpha_3, c.arm_short, DATE(e.created_at) AS REG_DATE, a.status AS EMP_STATUS, b.first_name_am, b.last_name_am, b.first_name_en, b.last_name_en, b.ssn, d.claim_id, d.serial_number, d.status as card_status, d.issue_date, d.expire_date, 'EAEU' as tablename, b.gender_id, a.user_id, f.status as fine_status
   FROM
	   eaeu_employees a
		   INNER JOIN
	   users b ON a.user_id = b.id
		   INNER JOIN
	   countries c ON a.citizenship_id = c.id
			  INNER JOIN 
	   claims e ON a.id = e.eaeu_employee_id
		   LEFT JOIN
	   ms_cards d ON e.id = d.claim_id
		   LEFT JOIN
	   fines f ON a.id = f.eaeu_employee_id
		   
   UNION    
   SELECT 
	a.birthday_day, a.birthday_month, a.birthday_year, e.status as claim_status, DATE(e.created_at) as claim_date, a.id, a.passport_number, a.citizenship_id, c.alpha_3, c.arm_short, DATE(e.created_at) AS REG_DATE, a.status AS EMP_STATUS, a.first_name_am, a.last_name_am, a.first_name_en, a.last_name_en, a.ssn, d.claim_id, d.serial_number, d.status as card_status, d.issue_date, d.expire_date, 'FAMILY' as tablename, a.gender_id, a.user_id, f.status as fine_status
   FROM
	   eaeu_employee_family_members a
		   INNER JOIN
	   users b ON a.user_id = b.id
		   INNER JOIN
	   countries c ON a.citizenship_id = c.id
		   INNER JOIN 
	   claims e ON a.id = e.eaeu_employee_family_member_id
		   LEFT JOIN
	   ms_cards d ON e.id = d.claim_id   
		   LEFT JOIN
	   fines f ON a.id = f.eaeu_employee_family_member_id
	   
	   ) AS ALL_PERSON
	   WHERE 1  `;

  if (created_at_start) {
    const startDate = convertToMysqlDate(created_at_start);

    baseQuery += `AND claim_date >= '${startDate}'  `;
  }

  if (created_at_end) {
    const endDate = convertToMysqlDate(created_at_end);

    baseQuery += ` AND claim_date <= '${endDate}' `;
  }

  if (birth_date_start && !birth_date_end) {
    const bDayArray = birth_date_start.split("/");

    const birth_date_start_day = bDayArray[0];
    const birth_date_start_month = bDayArray[1];
    const birth_date_start_year = bDayArray[2];
    baseQuery += ` AND birthday_day = '${birth_date_start_day}' AND birthday_month =  '${birth_date_start_month}' AND birthday_year = '${birth_date_start_year}' `;
  }
  if (birth_date_start && birth_date_end) {
    const bDayStartArray = birth_date_start.split("/");
    const bDayEndArray = birth_date_end.split("/");

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

  if (select_claim_status) {
    baseQuery += ` AND ALL_PERSON.claim_status = '${select_claim_status}' `;
  }

  // if (created_at_start && created_at_end) {
  //   const createDateArr = created_at_start.split("/");
  //   const createDateDay = createDateArr[0];
  //   const createDateMonth = createDateArr[1];
  //   const createDateYear = createDateArr[2];
  //   const formatedCreateDate = `${createDateYear}-${createDateMonth}-${createDateDay}`;
  //   baseQuery += `AND claim_date = '${formatedCreateDate}' `;
  // }

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

  if (select_card_status) {
    baseQuery += ` AND card_status = '${select_card_status}'`;
  }

  if (card_id) {
    baseQuery += ` AND serial_number = '${card_id}'`;
  }

  if (document_number) {
    baseQuery += ` AND passport_number = '${document_number}'`;
  }

  if (select_gender && select_gender != "0") {
    baseQuery += ` AND gender_id = ${select_gender}`;
  }

  if (select_procedure && select_procedure != "0") {
    baseQuery += ` AND tablename = '${select_procedure}'`;
  }

  if (select_country?.value && select_country.value != "0") {
    baseQuery += ` AND citizenship_id = ${select_country.value}`;
  }

  return baseQuery;
};

const getFullInfoBaseQuery = (tablename, emp_id) => {
  switch (tablename) {
    case TABLE_NAMES.FAMILY:
      return `SELECT 
    claims.id as claim_id,
    claims.status as claim_status,
    a.id,
    a.passport_number,
    a.passport_issued,
    a.passport_valid,
    a.citizenship_id,
    a.birthday_day,
    a.birthday_month,
    a.birthday_year,
    a.actual_address as full_address,
    a.status emplyee_status,
    a.first_name_am,
    a.first_name_en,
    a.last_name_am,
    a.last_name_en,
    a.patronymic_am,
    a.patronymic_en,
    a.email,
    a.ssn,
    a.telephone,
    a.gender_id,
    a.created_at AS user_created,
    c.name_am AS country_arm,
    c.name_en AS country_eng, 
    g.path,
    cards.serial_number,
    cards.issue_date as card_issued,
    cards.expire_date as card_valid,
    cards.status as card_status
    
FROM
    eaeu_employee_family_members a
        INNER JOIN
    countries c ON a.citizenship_id = c.id
        INNER JOIN 
    (SELECT 
        *
    FROM
       claims f 
    WHERE
        f.id = (SELECT 
                MAX(t4.id)
            FROM
               claims t4
            WHERE
                f.eaeu_employee_family_member_id = t4.eaeu_employee_family_member_id)) AS claims ON claims.eaeu_employee_family_member_id = a.id
    INNER JOIN 
        claim_files g ON g.claim_id = claims.id
    LEFT JOIN 
        (SELECT 
        *
    FROM
       ms_cards h
    WHERE
       h.id = (SELECT 
                MAX(t5.id)
            FROM
               ms_cards t5
            WHERE
                h.eaeu_employee_family_member_id = t5.eaeu_employee_family_member_id)) AS cards ON cards.eaeu_employee_family_member_id = a.id  
    WHERE a.id = ${emp_id} and g.type = 'photo' and g.active = '1'`;
    case TABLE_NAMES.EMPLOYEE:
      return `SELECT 
    claims.id as claim_id,
    claims.status as claim_status,
    a.id,
    a.passport_number,
    a.passport_issued,
    a.passport_valid,
    a.citizenship_id,
    a.actual_country_id,
    a.birthday_day,
    a.birthday_month,
    a.birthday_year,
    a.full_address,
    a.status emplyee_status,
    b.first_name_am,
    b.first_name_en,
    b.last_name_am,
    b.last_name_en,
    b.patronymic_am,
    b.patronymic_en,
    b.email,
    b.ssn,
    b.telephone,
    b.email_verified_at,
    b.last_active_at,
    b.gender_id,
    b.created_at AS user_created,
    c.name_am AS country_arm,
    c.name_en AS country_eng, 
    g.path,
    cards.serial_number,
    cards.issue_date as card_issued,
    cards.expire_date as card_valid,
    cards.status as card_status
    
FROM
    employees a
        INNER JOIN
    users b ON a.user_id = b.id
        INNER JOIN
    countries c ON a.citizenship_id = c.id
        INNER JOIN 
    (SELECT 
        *
    FROM
       claims f
    WHERE
        f.id = (SELECT 
                MAX(t4.id)
            FROM
               claims t4
            WHERE
                f.employee_id = t4.employee_id)) AS claims ON claims.employee_id = a.id
    INNER JOIN 
        claim_files g ON g.claim_id = claims.id
    LEFT JOIN 
        (SELECT 
        *
    FROM
       ms_cards h
    WHERE
       h.id = (SELECT 
                MAX(t5.id)
            FROM
               ms_cards t5
            WHERE
                h.employee_id = t5.employee_id)) AS cards ON cards.employee_id = a.id 
      where a.id = ${emp_id} and g.type = 'photo' and g.active = '1'`;
    case TABLE_NAMES.EAEU:
      return `SELECT 
    claims.id as claim_id,
    claims.status as claim_status,
    a.id,
    a.passport_number,
    a.passport_issued,
    a.passport_valid,
    a.citizenship_id,
    a.birthday_day,
    a.birthday_month,
    a.birthday_year,
    a.actual_address as full_address,
    a.status emplyee_status,
    b.first_name_am,
    b.first_name_en,
    b.last_name_am,
    b.last_name_en,
    b.patronymic_am,
    b.patronymic_en,
    b.email,
    b.ssn,
    b.telephone,
    b.email_verified_at,
    b.last_active_at,
    b.gender_id,
    b.created_at AS user_created,
    c.name_am AS country_arm,
    c.name_en AS country_eng, 
    g.path,
    cards.serial_number,
    cards.issue_date as card_issued,
    cards.expire_date as card_valid,
    cards.status as card_status
    
FROM
    eaeu_employees a
        INNER JOIN
    users b ON a.user_id = b.id
        INNER JOIN
    countries c ON a.citizenship_id = c.id
        INNER JOIN 
    (SELECT 
        *
    FROM
       claims f
    WHERE
        f.id = (SELECT 
                MAX(t4.id)
            FROM
               claims t4
            WHERE
                f.eaeu_employee_id = t4.eaeu_employee_id)) AS claims ON claims.eaeu_employee_id = a.id
    INNER JOIN 
        claim_files g ON g.claim_id = claims.id
    LEFT JOIN 
        (SELECT 
        *
    FROM
       ms_cards h
    WHERE
       h.id = (SELECT 
                MAX(t5.id)
            FROM
               ms_cards t5
            WHERE
                h.eaeu_employee_id = t5.eaeu_employee_id)) AS cards ON cards.eaeu_employee_id = a.id
    where a.id = ${emp_id} and g.type = 'photo' and g.active = '1'`;
    default:
      return "";
  }
};

const getFinesQuery = (tableName, emp_id) => {
  switch (tableName) {
    case TABLE_NAMES.FAMILY:
      return `SELECT a.claim_id, a.employee_id, a.eaeu_employee_id, 
                      a.eaeu_employee_family_member_id, a.status, 
                      a.created_at as notify_date, b.created_at as fined_date
               FROM fines a 
               left join fine_logs b on b.fine_id = a.id 
               where eaeu_employee_family_member_id = ${emp_id}`;
    case TABLE_NAMES.EMPLOYEE:
      return `SELECT a.claim_id, a.employee_id, a.eaeu_employee_id, 
                      a.eaeu_employee_family_member_id, a.status, 
                      a.created_at as notify_date, b.created_at as fined_date
               FROM fines a 
               left join fine_logs b on b.fine_id = a.id 
               where employee_id = ${emp_id}`;
    case TABLE_NAMES.EAEU:
      return `SELECT a.claim_id, a.employee_id, a.eaeu_employee_id, 
                      a.eaeu_employee_family_member_id, a.status, 
                      a.created_at as notify_date, b.created_at as fined_date
               FROM fines a 
               left join fine_logs b on b.fine_id = a.id 
               where eaeu_employee_id = ${emp_id}`;
    default:
      return "";
  }
};

const getClaimsQuery = (tableName, emp_id) => {
  switch (tableName) {
    case TABLE_NAMES.FAMILY:
      return `SELECT 
          a.id,
          a.eaeu_employee_family_member_id,
          a.created_at,
          a.status,
          a.type,
          c.first_name_am as officer_name,
          c.last_name_am as officer_last_name,
          log.action,
          log.created_at as log_created_at,
          log.send_number
      FROM
          claims a
              LEFT JOIN
          ms_employees b ON a.ms_employee_id = b.id
              LEFT JOIN
          users c ON b.user_id = c.id
              LEFT JOIN
          (SELECT 
              *
          FROM
              ms_logs
          WHERE
              type = 6) AS log ON log.claim_id = a.id
      WHERE a.eaeu_employee_family_member_id = ${emp_id}`;
    case TABLE_NAMES.EMPLOYEE:
      return `SELECT 
            a.id,
            a.employee_id,
            a.created_at,
            a.status,
            a.type,
            c.first_name_am as officer_name,
            c.last_name_am as officer_last_name,
            log.action,
            log.created_at as log_created_at,
            log.send_number
        FROM
            claims a
                LEFT JOIN
            ms_employees b ON a.ms_employee_id = b.id
                LEFT JOIN
            users c ON b.user_id = c.id
                LEFT JOIN
            (SELECT 
                *
            FROM
                ms_logs
            WHERE
                type = 6) AS log ON log.claim_id = a.id
         WHERE a.employee_id = ${emp_id}`;
    case TABLE_NAMES.EAEU:
      return `SELECT 
        a.id,
        a.eaeu_employee_id,
        a.created_at,
        a.status,
        a.type,
        c.first_name_am as officer_name,
        c.last_name_am as officer_last_name,
        log.action,
        log.created_at as log_created_at,
        log.send_number
    FROM
        claims a
            LEFT JOIN
        ms_employees b ON a.ms_employee_id = b.id
            LEFT JOIN
        users c ON b.user_id = c.id
            LEFT JOIN
        (SELECT 
            *
        FROM
            ms_logs
        WHERE
            type = 6) AS log ON log.claim_id = a.id
     WHERE a.eaeu_employee_id = ${emp_id}`;
    default:
      return "";
  }
};

const getCardsQuery = (tableName, emp_id) => {
  switch (tableName) {
    case TABLE_NAMES.FAMILY:
      return `SELECT * FROM ms_cards  WHERE eaeu_employee_family_member_id = ${emp_id}`;
    case TABLE_NAMES.EMPLOYEE:
      return `SELECT * FROM ms_cards  WHERE employee_id = ${emp_id}`;
    case TABLE_NAMES.EAEU:
      return `SELECT * FROM ms_cards  WHERE eaeu_employee_id = ${emp_id}`;
    default:
      return "";
  }
};

const getFamilyMemberQuery = (tableName, user_id) => {
  switch (tableName) {
    case TABLE_NAMES.EAEU:
      return `SELECT 
            a.id,
            a.user_id,
            a.first_name_en,
            a.last_name_en,
            a.passport_number,
            a.citizenship_id,
            a.ssn,
            a.family_member_id,
            c.alpha_3,
            c.arm_short,
            b.id AS claim_id,
            b.type AS claim_type,
            b.status AS claim_status,
            cards.serial_number,
            cards.issue_date as card_issued,
            cards.expire_date as card_valid,
            cards.status as card_status
        FROM
            eaeu_employee_family_members a
                INNER JOIN
            claims b ON a.id = b.eaeu_employee_family_member_id
                INNER JOIN
            countries c ON a.citizenship_id = c.id
                LEFT JOIN
            ms_cards cards ON cards.claim_id = b.id
        WHERE a.user_id = ${user_id}`;
    default:
      return "";
  }
};

const formatBaseResult = (result) => {
  if (!result) return null;
  const data = result[0];

  if (data.path) {
    data.path = `${process.env.WP_IMAGE_SERVER_URL}${data.path}`;
  }
  if (data.gender_id) {
    data.genderText = data.gender_id === 1 ? "արական / male" : "իգական / female";
  }
  return data;
};

export {
  getWpQuery,
  getEatmQuery,
  getEatmFamilyMemberQuery,
  extractData,
  filterWpPersonsQuery,
  getFullInfoBaseQuery,
  getFinesQuery,
  formatBaseResult,
  getClaimsQuery,
  getCardsQuery,
  getFamilyMemberQuery,
};
