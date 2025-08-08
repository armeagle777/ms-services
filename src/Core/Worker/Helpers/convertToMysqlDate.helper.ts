export const convertToMysqlDate = (dateStr: string): string => {
   const [day, month, year] = dateStr.split('/');
   return `${year}-${month}-${day}`;
};
