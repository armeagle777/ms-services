export interface PetregistrCompany {
   // TODO: refine fields based on PETREGISTR response
   [key: string]: unknown;
}

export interface PetregistrPersonResponse {
   companies: PetregistrCompany[];
   // TODO: add remaining fields from PETREGISTR person response
   [key: string]: unknown;
}
