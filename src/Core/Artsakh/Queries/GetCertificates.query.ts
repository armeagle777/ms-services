export const getDisplacementCertsQuery = (pnum: string) => `SELECT C.serial_number,
                                        C.id,
                                        C.document_number,
                                        O.code AS issue_by_office,
                                        C.issue_date,
                                        C.expire_date,
                                        C.actual,
                                        C.printed_at,
                                        C.handed_at,
                                        L.f_name_arm,
                                        L.l_name_arm
                                        FROM jkk_certificates C
                                        LEFT JOIN local_offices O ON O.id = C.issue_by_office
                                        LEFT JOIN jkk_claims CL ON CL.id=C.claim_id
                                        LEFT JOIN jkk_list L ON L.id = CL.jkk_list_id
                                        WHERE C.pnum = "${pnum}"`;
