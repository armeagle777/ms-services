export const FindAllQuery = `
    Select 
        community_id,
        marz_id,
        ADM3_PCODE,
        ADM3_ARM,
        ADM3_EN,
        exist,
        active
    FROM tb_arm_com
    `;
