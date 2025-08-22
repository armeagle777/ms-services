// export const FilterWorkersBaseQuery = `SELECT
// 			ALL_PERSON.tablename,
// 			ALL_PERSON.id,
// 			ALL_PERSON.passport_number,
// 			ALL_PERSON.citizenship_id,
// 			ALL_PERSON.ssn,
// 			ALL_PERSON.alpha_3,
// 			ALL_PERSON.arm_short,
// 			ALL_PERSON.first_name_en,
// 			ALL_PERSON.first_name_am,
// 			ALL_PERSON.last_name_en,
// 			ALL_PERSON.last_name_am,
// 			ALL_PERSON.gender_id,
// 			ALL_PERSON.user_id,
// 			ALL_PERSON.EMP_STATUS,
// 			ALL_PERSON.birthday_day,
// 			ALL_PERSON.birthday_month,
// 			ALL_PERSON.birthday_year,
// 			ALL_PERSON.path

// 		FROM (
// 		SELECT
// 			a.birthday_day,
// 			a.birthday_month,
// 			a.birthday_year,
// 			a.id,
// 			a.passport_number,
// 			a.citizenship_id,
// 			c.alpha_3,
// 			c.arm_short,
// 			a.status AS EMP_STATUS,
// 			b.first_name_am,
// 			b.last_name_am,
// 			b.first_name_en,
// 			b.last_name_en,
// 			b.ssn,
// 			'Employee' as tablename,
// 			b.gender_id,
// 			a.user_id,
// 			f.status as fine_status,
// 			cf.path
// 		FROM
// 			employees a
// 				LEFT JOIN
// 			users b ON a.user_id = b.id
// 				LEFT JOIN
// 			countries c ON a.citizenship_id = c.id
// 				LEFT JOIN
// 			claims ON claims.employee_id=a.id
// 				LEFT JOIN
// 			claim_files cf ON cf.claim_id = claims.id AND cf.type='photo' AND cf.active=1
// 				LEFT JOIN
// 			fines f ON a.id = f.employee_id

// 		UNION
// 		SELECT
// 			a.birthday_day,
// 			a.birthday_month,
// 			a.birthday_year,
// 			a.id,
// 			a.passport_number,
// 			a.citizenship_id,
// 			c.alpha_3,
// 			c.arm_short,
// 			a.status AS EMP_STATUS,
// 			b.first_name_am,
// 			b.last_name_am,
// 			b.first_name_en,
// 			b.last_name_en,
// 			b.ssn,
// 			'EAEU' as tablename,
// 			b.gender_id,
// 			a.user_id,
// 			f.status as fine_status,
// 			ef.path
// 		FROM
// 			eaeu_employees a
// 				LEFT JOIN
// 			users b ON a.user_id = b.id
// 				LEFT JOIN
// 			countries c ON a.citizenship_id = c.id
// 				LEFT JOIN
// 			eaeu_employee_files ef ON ef.eaeu_employee_id = a.id AND ef.type='photo' AND ef.active=1
// 				LEFT JOIN
// 			fines f ON a.id = f.eaeu_employee_id

// 		UNION
// 		SELECT
// 			a.birthday_day,
// 			a.birthday_month,
// 			a.birthday_year,
// 			a.id,
// 			a.passport_number,
// 			a.citizenship_id,
// 			c.alpha_3,
// 			c.arm_short,
// 			a.status AS EMP_STATUS,
// 			a.first_name_am,
// 			a.last_name_am,
// 			a.first_name_en,
// 			a.last_name_en,
// 			a.ssn,
// 			'FAMILY' as tablename,
// 			a.gender_id,
// 			a.user_id,
// 			f.status as fine_status,
// 			eff.path
// 		FROM
// 			eaeu_employee_family_members a
// 				LEFT JOIN
// 			users b ON a.user_id = b.id
// 				LEFT JOIN
// 			countries c ON a.citizenship_id = c.id
// 				LEFT JOIN
// 			eaeu_employee_family_member_files eff ON eff.eaeu_employee_family_member_id = a.id AND eff.type='photo' AND eff.active=1
// 				LEFT JOIN
// 			fines f ON a.id = f.eaeu_employee_family_member_id

// 			) AS ALL_PERSON
// 			WHERE 1  `;

export const FilterWorkersBaseQuery = ` SELECT ALL_PERSON.* FROM (
	SELECT
		'employee' as tableName, 
		a.id AS claim_id, 
		c.ssn, 
		c.first_name_am, 
		c.last_name_am, 
		c.first_name_en, 
		c.last_name_en, 
		c.gender_id,
		b.id,
		b.user_id,  
		b.birthday_year, 
		b.birthday_month, 
		b.birthday_day, 
		b.passport_number, 
		d.id as citizenship_id, 
		d.alpha_3, 
		d.arm_short, 
		d.name_am, 
		d.name_en, 
		e.path
	FROM claims a
		INNER JOIN employees b ON a.employee_id = b.id
		INNER JOIN users c ON b.user_id = c.id
		INNER JOIN countries d on b.citizenship_id = d.id
		INNER JOIN (select i.id, i.path, i.claim_id from claim_files i where i.type = 'photo' and i.active = 1 and i.id = (select MAX(i2.id) from claim_files i2 where i2.claim_id = i.claim_id and i2.type = 'photo' and i2.active = 1)) e on a.id = e.claim_id
	WHERE a.employee_id IS NOT NULL
		AND a.id = (
			SELECT MAX(t2.id)
			FROM claims t2
			WHERE t2.employee_id = a.employee_id
				AND t2.employee_id IS NOT NULL
		)
	
	UNION ALL

	SELECT
		'eaeu_employee' as tableName, 
		a.id AS claim_id, 
		c.ssn, 
		c.first_name_am, 
		c.last_name_am, 
		c.first_name_en, 
		c.last_name_en, 
		c.gender_id,
		b.id,
		b.user_id, 
		b.birthday_year, 
		b.birthday_month, 
		b.birthday_day, 
		b.passport_number, 
		d.id as citizenship_id, 
		d.alpha_3, 
		d.arm_short, 
		d.name_am, 
		d.name_en, 
		e.path
	FROM claims a
		INNER JOIN eaeu_employees b ON a.eaeu_employee_id = b.id
		INNER JOIN users c ON b.user_id = c.id
		INNER JOIN countries d on b.citizenship_id = d.id
		INNER JOIN (select i.id, i.path, i.claim_id from claim_files i where i.type = 'photo' and i.active = 1 and i.id = (select MAX(i2.id) from claim_files i2 where i2.claim_id = i.claim_id and i2.type = 'photo' and i2.active = 1)) e on a.id = e.claim_id
	WHERE a.eaeu_employee_id IS NOT NULL
		AND a.id = (
			SELECT MAX(t2.id)
			FROM claims t2
			WHERE t2.eaeu_employee_id = a.eaeu_employee_id
				AND t2.eaeu_employee_id IS NOT NULL
		)

	UNION ALL

	SELECT
		'eaeu_family' as tableName, 
		a.id AS claim_id, 
		b.ssn,
		b.id,
		b.user_id,
		b.first_name_am, 
		b.last_name_am, 
		b.first_name_en, 
		b.last_name_en, 
		b.gender_id, 
		b.birthday_year, 
		b.birthday_month, 
		b.birthday_day, 
		b.passport_number, 
		d.id as citizenship_id, 
		d.alpha_3, 
		d.arm_short, 
		d.name_am, 
		d.name_en, 
		e.path
	FROM claims a
		INNER JOIN eaeu_employee_family_members b ON a.eaeu_employee_family_member_id = b.id
		INNER JOIN countries d on b.citizenship_id = d.id
		INNER JOIN (select i.id, i.path, i.claim_id from claim_files i where i.type = 'photo' and i.active = 1 and i.id = (select MAX(i2.id) from claim_files i2 where i2.claim_id = i.claim_id and i2.type = 'photo' and i2.active = 1)) e on a.id = e.claim_id
	WHERE a.eaeu_employee_family_member_id IS NOT NULL
		AND a.id = (
			SELECT MAX(t2.id)
			FROM claims t2
			WHERE t2.eaeu_employee_family_member_id = a.eaeu_employee_family_member_id
				AND t2.eaeu_employee_family_member_id IS NOT NULL
		) 
	) AS ALL_PERSON WHERE 1`;
