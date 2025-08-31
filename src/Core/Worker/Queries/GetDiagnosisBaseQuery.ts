export const GetDiagnosisBaseQuery = `WITH LatestPKI AS (
    SELECT *
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY id DESC) AS rn
        FROM ejbc_request_log
    ) AS pk
    WHERE rn = 1
),

AllCards AS (
    SELECT
        a.id AS card_id,
        b.id AS emp_id,
        a.serial_number,
        a.status AS card_status,
        a.issue_date,
        a.expire_date,
        c.first_name_am,
        c.last_name_am,
        c.first_name_en,
        c.last_name_en,
        c.ssn,
        a.transferred_at,
        'wp_emp' AS procedure_type,
        d.receipt_type
    FROM ms_cards a
    INNER JOIN employees b ON a.employee_id = b.id
    INNER JOIN users c ON b.user_id = c.id
    LEFT JOIN ms_card_receipts d ON a.id = d.ms_card_id
    WHERE a.card_photo IS NULL 
      AND a.employee_id IS NOT NULL 
      AND c.ssn IS NOT NULL

    UNION ALL

    SELECT
        a.id AS card_id,
        b.id AS emp_id,
        a.serial_number,
        a.status AS card_status,
        a.issue_date,
        a.expire_date,
        c.first_name_am,
        c.last_name_am,
        c.first_name_en,
        c.last_name_en,
        c.ssn,
        a.transferred_at,
        'wp_eaeu' AS procedure_type,
        d.receipt_type
    FROM ms_cards a
    INNER JOIN eaeu_employees b ON a.eaeu_employee_id = b.id
    INNER JOIN users c ON b.user_id = c.id
    LEFT JOIN ms_card_receipts d ON a.id = d.ms_card_id
    WHERE a.card_photo IS NULL 
      AND a.eaeu_employee_id IS NOT NULL 
      AND c.ssn IS NOT NULL

    UNION ALL

    SELECT
        a.id AS card_id,
        b.id AS emp_id,
        a.serial_number,
        a.status AS card_status,
        a.issue_date,
        a.expire_date,
        b.first_name_am,
        b.last_name_am,
        b.first_name_en,
        b.last_name_en,
        b.ssn,
        a.transferred_at,
        'wp_family' AS procedure_type,
        d.receipt_type
    FROM ms_cards a
    INNER JOIN eaeu_employee_family_members b ON a.eaeu_employee_family_member_id = b.id
    LEFT JOIN ms_card_receipts d ON a.id = d.ms_card_id
    WHERE a.card_photo IS NULL 
      AND a.eaeu_employee_family_member_id IS NOT NULL 
      AND b.ssn IS NOT NULL

    UNION ALL

    SELECT
        a.id AS card_id,
        b.id AS emp_id,
        a.serial_number,
        a.status AS card_status,
        a.issue_date,
        a.expire_date,
        b.first_name_am,
        b.last_name_am,
        b.first_name_en,
        b.last_name_en,
        b.ssn,
        a.transferred_at,
        'not_wp' AS procedure_type,
        d.receipt_type
    FROM ms_cards a
    INNER JOIN not_wp_foreigners b ON a.not_wp_foreigner_id = b.id
    LEFT JOIN ms_card_receipts d ON a.id = d.ms_card_id
    WHERE a.card_photo IS NULL 
      AND a.not_wp_foreigner_id IS NOT NULL 
      AND b.ssn IS NOT NULL
)

SELECT
    all_cards.*,
    pk.create_pki,
    pk.response_status,
    pk.created_at AS pki_generation_date
FROM AllCards AS all_cards
LEFT JOIN LatestPKI AS pk ON all_cards.card_id = pk.card_id
WHERE 1`;
