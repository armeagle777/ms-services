export interface PersonDocument {
   // TODO: refine fields based on BPR response
   [key: string]: unknown;
}

export interface PersonAddress {
   // TODO: refine fields based on BPR response
   [key: string]: unknown;
}

export interface PersonResponse {
   addresses: PersonAddress[];
   documents: PersonDocument[];
   // TODO: add remaining fields from BPR response
   [key: string]: unknown;
}

export interface PersonSearchResponse extends PersonResponse {
   test: string; // TODO: remove this after refining PersonResponse fields
}

export interface TaxPayerInfo {
   // TODO: refine tax response fields
   [key: string]: unknown;
}

export interface RoadPoliceResponse {
   license: unknown | null;
   vehicles: unknown[] | null;
}

export interface VehicleSearchResponse {
   vehicles: unknown[] | null;
}

export interface BordercrossResponse {
   visaList?: unknown;
   crossingList?: unknown;
   residencePermitList?: unknown;
}

export interface PoliceResponse {
   // TODO: refine police response fields
   [key: string]: unknown;
}

export interface QkagDocumentResponse {
   // TODO: refine QKAG document fields
   [key: string]: unknown;
}

export interface PetregistrCompanyResponse {
   // TODO: refine company response fields
   [key: string]: unknown;
}
