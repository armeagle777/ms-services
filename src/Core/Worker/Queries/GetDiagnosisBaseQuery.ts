export const GetDiagnosisBaseQuery = `WITH LatestPKI AS (
            SELECT card_id, create_pki, response_status, created_at
            FROM (
                SELECT card_id,
                       create_pki,
                       response_status,
                       created_at,
                       ROW_NUMBER() OVER (PARTITION BY card_id ORDER BY id DESC) AS rn
                FROM ejbc_request_log
            ) pk
            WHERE rn = 1
        ),
        AllCards AS (
            -- same UNION ALL branches as before
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
                'wp_emp' as procedure_type,
                d.receipt_type
            FROM ms_cards a
            INNER JOIN employees b ON a.employee_id = b.id
            INNER JOIN users c ON b.user_id = c.id
            LEFT JOIN ms_card_receipts d ON a.id = d.ms_card_id
            WHERE a.card_photo IS NULL AND a.employee_id IS NOT NULL AND c.ssn IS NOT NULL

            UNION ALL
            -- ... other 3 unions unchanged
        )
        SELECT
            all_cards.*,
            pk.create_pki,
            pk.response_status,
            pk.created_at AS pki_generation_date
        FROM AllCards all_cards
        LEFT JOIN LatestPKI pk ON all_cards.card_id = pk.card_id
        WHERE 1 `;
