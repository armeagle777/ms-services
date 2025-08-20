export const FindAllQuery = `
    Select 
        settlement_id,
        com_id,
        ADM3_CODE,
        ADM4_PCODE,
        ADM4_ARM,
        ADM4_ENG
        FROM tb_settlement
    `;
