import { RefugeeCountry } from 'src/Core/Country/Models';
import { AsylumEthnics } from 'src/Core/Ethnics/Models';
import { AsylumReligion } from 'src/Core/Religion/Models';

export interface IGetFilterOptionsResponseModel {
   countries: RefugeeCountry[];
   ethnics: AsylumEthnics[];
   religions: AsylumReligion[];
}
