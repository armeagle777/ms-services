export const formatGetWpQuery = (pnum: string): string => `SELECT
                    a.ssn,
                    b.id AS employee_id,
                    c.id AS claim_id,
                    c.created_at as claim_created_at,
                    c.status,
                    c.type as claim_type,
                    log.created_at as decision_date,
                    log.action,
                    log.type,
                    d.serial_number,
                    d.status as card_status,
                    d.issue_date,
                    d.expire_date,
                    d.printed_at,
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
                left join 
                    (select path, claim_id from claim_files p where p.active = 1 and p.type = 'photo') as image on image.claim_id = c.id
                WHERE
                    a.ssn ="${pnum}" 
                    and c.status != 'pending_foreigner'`;
