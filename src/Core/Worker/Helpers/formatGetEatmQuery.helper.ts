export const formatGetEatmQuery = (pnum: string): string => `SELECT
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
                        c.created_at as claim_created_at,
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
