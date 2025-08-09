import { IWorkerCard } from '../Models';

export function extractWpData<T extends IWorkerCard>(
   rows: T[] | null | undefined,
): {
   cards: IWorkerCard[];
   data: Omit<T, keyof IWorkerCard>[] | null;
} {
   const cards: IWorkerCard[] = [];
   const data = rows?.map((row) => {
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
      return rowData as Omit<T, keyof IWorkerCard>;
   });

   return { cards, data: data ?? null };
}
