export function parseInfo(info) {
   const rawText = String(info || '').replace(/\r/g, '');

   const get = (label) => {
      const regex = new RegExp(`${label}[՝\`]\\s*([^\\n]+)`, 'u');
      return rawText.match(regex)?.[1]?.trim() || null;
   };

   const normalizeDate = (value) => {
      if (!value) return null;

      const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (!match) return value;

      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
   };

   const fullName = rawText.match(/\d+\.\s*(.+?)\s*,/)?.[1]?.trim() || null;

   return {
      fullName,
      birthDate: normalizeDate(get('Ծննդյան ամսաթիվը')),
      birthPlace: get('Ծննդավայրը'),

      violationDate: normalizeDate(get('Իրավախախտման ամսաթիվը')),
      article: get('հոդված'),
      decisionDate: normalizeDate(get('Որոշումն ընդունելու ամսաթիվը')),
      decisionAuthority: get('Որոշումն ընդունող մարմինը'),
      punishmentType: get('Վարչ\\.\\s*տույժի տեսակը'),
      recordedBy: get('Իրավախախտումն արձանագրած մարմին'),

      rawText,
   };
}
