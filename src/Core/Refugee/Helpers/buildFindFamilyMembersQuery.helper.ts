export const buildFindFamilyMembersQuery = (personalId: number) => {
   return `
    SELECT 
        P.personal_id, 
        P.case_id, 
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
        R.der AS ROLE_NAME
    FROM tb_person P
        LEFT JOIN tb_role  R ON R.role_id = P.role 
        JOIN tb_case C ON P.case_id = C.case_id
    WHERE P.case_id = (
            SELECT case_id 
            FROM tb_person 
            WHERE personal_id = ${personalId}
        )
        AND P.personal_id <> ${personalId}
    `;
};
