export class McsSearchPersonsDto {
   addressType?: 'BIRTH' | 'LIVING';
   registrationType?: 'EVER' | 'CURRENT';
   firstName?: string;
   lastName?: string;
   patronomicName?: string;
   birthDate?: string;
   firstNameMatchType?: 'exact' | 'partial';
   lastNameMatchType?: 'exact' | 'partial';
   patronomicNameMatchType?: 'exact' | 'partial';
   region?: string;
   community?: string;
   residence?: string;
   street?: string;
   building?: string;
   apartment?: string;
   appartment?: string;
   age?: { min?: number | null; max?: number | null };
   gender?: 'MALE' | 'FEMALE' | '';
}
