export const convertToMysqlDate = (dateStr) => {
   const [day, month, year] = dateStr.split('/');
   return `${year}-${month}-${day}`;
};
