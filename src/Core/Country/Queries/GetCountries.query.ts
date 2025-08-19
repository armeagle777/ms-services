export const GetWpCountriesQuery =
   'Select id,name_en,name_am,name_ru from countries WHERE status=1 ORDER BY name_am ASC';
