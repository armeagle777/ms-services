//TODO Create type for baseInfo
export const formatBaseInfoResult = async (baseInfo: any) => {
   if (!baseInfo) return null;
   const data = baseInfo[0];

   if (data.gender_id) {
      data.genderText = data.gender_id === 1 ? 'արական / male' : 'իգական / female';
   }
   return data;
};
