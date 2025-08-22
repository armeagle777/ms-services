export const buildFindByIdQuery = (personalId: number) => {
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
        P.citizenship, 
        P.previous_residence, 
        P.citizen_adr, 
        P.residence_adr, 
        P.departure_from_citizen, 
        P.departure_from_residence, 
        P.arrival_date, 
        P.doc_num, 
        P.etnicity, 
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
        P.person_status,
        C.country_arm AS CITIZENSHIP_COUNTRY_NAME,
        R.country_arm AS PREVIOUS_RESIDENCE_COUNTRY_NAME,
        ET.etnic_eng AS ETNICITY_NAME,
        REL.religion_arm AS RELIGION_NAME,
        ROL.der AS ROLE_NAME,
        PS.person_status AS PERSON_STATUS_NAME,
        CS.contact_email,
        CS.contact_tel,
        CS.RA_street AS STREET_NAME,
        CS.RA_building AS BUILDING_NUMBER,
        CS.RA_apartment AS APPARTMENT_NUMBER,
        M.ADM1_ARM AS MARZ_NAME,
        CM.ADM3_ARM AS COMMUNITY_NAME,
        STL.ADM4_ARM AS SETTLEMENT_NAME
    FROM tb_person P
        LEFT JOIN tb_country C ON C.country_id=P.citizenship
        LEFT JOIN tb_country R ON R.country_id=P.previous_residence
        LEFT JOIN tb_etnics ET ON ET.etnic_id = P.etnicity
        LEFT JOIN tb_religions  REL ON REL.religion_id = P.religion
        LEFT JOIN tb_role  ROL ON ROL.role_id = P.role
        LEFT JOIN tb_person_status  PS ON PS.person_status_id = P.person_status
        LEFT JOIN tb_case  CS ON CS.case_id=P.case_id
        LEFT JOIN tb_marz M ON M.marz_id=CS.RA_marz
        LEFT JOIN tb_arm_com CM ON CM.community_id=CS.RA_community
        LEFT JOIN tb_settlement STL ON STL.settlement_id=CS.RA_settlement
    WHERE P.personal_id = ${personalId}
    `;
};
