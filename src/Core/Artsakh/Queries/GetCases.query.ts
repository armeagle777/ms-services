export const getDisplacementCasesQuery = (pnum: string) => `SELECT
                                        C.filled_in AS registartion_date,
                                        C.fill_in_date AS db_input_date,
                                        C.body,
                                        C.officer,
                                        C.case_id,
                                        C.contact,
                                        CT.case_type_name,
                                        AT.address_type,
                                        M.ADM1_ARM AS marz,
                                        Com.ADM3_ARM AS community,
                                        Stl.ADM4_ARM AS settlement,
                                        C.street,
                                        C.building,
                                        C.apartmant,
                                        CP.actual,
                                        AR.Prov_arm AS a_province,
                                        AC.Name_arm AS a_community,
                                        P.address AS a_address
                                        FROM tb_case C
                                        LEFT JOIN tb_case_person CP ON CP.case_id = C.case_id
                                        LEFT JOIN tb_person P ON P.personal_id = CP.personal_id
                                        LEFT JOIN un_a_region AR ON AR.aregion_id=P.region
                                        LEFT JOIN un_a_community AC ON AC.a_community_id=P.community
                                        LEFT JOIN un_marz M ON M.marz_id=C.marz
                                        LEFT JOIN un_arm_com Com ON Com.community_id=C.community
                                        LEFT JOIN un_settlement Stl ON Stl.settlement_id=C.settlement 
                                        LEFT JOIN tb_address_type AT ON AT.address_type_id=C.address_type
                                        LEFT JOIN case_types CT ON CT.id = C.case_type_id
                                        WHERE P.pnum = "${pnum}"`;
