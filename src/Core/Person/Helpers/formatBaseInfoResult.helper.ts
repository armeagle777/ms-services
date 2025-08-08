//TODO Create type for baseInfo
export const formatBaseInfoResult = (baseInfo: any) => {
   if (!baseInfo) return null;
   const data = baseInfo[0];

   if (data.path) {
      data.path = `${process.env.WP_IMAGE_SERVER_URL}${data.path}`;
   }
   if (data.gender_id) {
      data.genderText = data.gender_id === 1 ? 'արական / male' : 'իգական / female';
   }
   return data;
};
