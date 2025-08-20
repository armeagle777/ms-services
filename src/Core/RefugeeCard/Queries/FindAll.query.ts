export const FindAllQuery = `
    Select
        card_id,
        serial, 
        card_number,
        personal_id,
        issued, 
        full_address, 
        valid, 
        bar, 
        printed, 
        actual_card
    FROM tb_cards
`;
