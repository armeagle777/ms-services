export const FilterWorkersBaseQuery = `SELECT ALL_PERSON.tablename, ALL_PERSON.id, ALL_PERSON.passport_number, ALL_PERSON.citizenship_id, ALL_PERSON.ssn, ALL_PERSON.alpha_3, ALL_PERSON.arm_short, ALL_PERSON.first_name_en, ALL_PERSON.last_name_en,ALL_PERSON.serial_number, ALL_PERSON.issue_date, ALL_PERSON.expire_date, ALL_PERSON.card_status, 
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
