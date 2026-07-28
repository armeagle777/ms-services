export class InterpolSearchRequestDto {
   name?: string;
   forename?: string;
   ageMin?: number;
   ageMax?: number;
   dateOfBirth?: string;
   identity?: string;
   entityId?: string;
   dob?: string;
   nb?: number;
   nbRecord?: number;
   /**
    * Relevance threshold forwarded to INTERPOL FIND as `Rankthreshold` (SearchEx).
    * Integer 0-10, where 10 is the strictest (per FIND 1.2 docs, a threshold of 10
    * returns only exact matches on name, forename and date of birth).
    * Omit to get the most relevant search (defaults to 10).
    */
   score?: number;
}

export class InterpolDetailsQueryDto {
   item_id!: string;
}

export class InterpolDownloadNoticeQueryDto {
   path!: string;
}

export class InterpolDownloadImageQueryDto {
   item_id!: string;
   path!: string;
}

export class InterpolSltdSearchRequestDto {
   din!: string;
   countryOfRegistration!: string;
   typeOfDocument!: string;
   nb?: number;
}

export class InterpolSltdDetailsRequestDto {
   id!: string;
}
