export class InterpolSearchRequestDto {
   name!: string;
   forename!: string;
   dob?: string;
   nb?: number;
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
