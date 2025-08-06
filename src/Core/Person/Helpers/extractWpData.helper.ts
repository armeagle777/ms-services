export const extractWpData = (row) => {
   const cards = [];
   const data = row?.map((row) => {
      const {
         serial_number,
         issue_date,
         expire_date,
         printed_at,
         card_status,
         transferred_at,
         ...rowData
      } = row;
      if (serial_number) {
         cards.push({
            serial_number,
            issue_date,
            expire_date,
            printed_at,
            card_status,
            transferred_at,
         });
      }
      return rowData;
   });

   return { cards, data: data ?? null };
};
