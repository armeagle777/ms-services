export interface BordercrossCrossing {
   direction: string;
   datetime: string;
   name: string;
   surname: string;
   birthDate: string;
   passport: string;
   status: string;
}

export interface BordercrossResidencePermit {
   type: string;
   cardNumber: string;
   cardIssued: string;
   cardValid: string;
   status: string;
}

export interface BordercrossDocumentNumber {
   docNr: string;
   countryCode: string;
   country: string;
}

export interface ExtendedBordercrossResponse {
   crossingList?: BordercrossCrossing[];
   residencePermitList?: BordercrossResidencePermit[];
   documentNumberList?: BordercrossDocumentNumber[];
   restrictedInfo?: number;
}
