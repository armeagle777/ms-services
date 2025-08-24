export const FilterRefugeeBaseQuery = `
    SELECT 
        P.personal_id, 
        P.case_id, 
        P.doc_num,
        P.f_name_arm, 
        P.f_name_eng, 
        P.l_name_arm, 
        P.l_name_eng, 
        P.m_name_arm, 
        P.m_name_eng, 
        P.b_day, 
        P.b_month, 
        P.b_year, 
        P.sex, 
        P.religion, 
        P.invalid, 
        P.pregnant, 
        P.seriously_ill, 
        P.trafficking_victim, 
        P.violence_victim, 
        P.comment, 
        P.illegal_border, 
        P.transfer_moj, 
        P.deport_prescurator, 
        P.prison, 
        P.role, 
        P.image,
        C.country_arm AS CITIZENSHIP_NAME_ARM,
        C.country_eng AS CITIZENSHIP_NAME_ENG, 
        R.der AS ROLE_NAME
    FROM tb_person P
        LEFT JOIN tb_role  R ON R.role_id = P.role
        LEFT JOIN tb_country C ON C.country_id = P.citizenship
    WHERE 1 `;
