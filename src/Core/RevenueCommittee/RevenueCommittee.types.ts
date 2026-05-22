export interface TaxObligationsResponse {
   // TODO: refine fields based on TAX response
   [key: string]: unknown;
}

export interface TaxPersonObligationsResponse {
   // TODO: refine fields based on TAX response
   [key: string]: unknown;
}

export interface EmploymentContractResponse {
   // TODO: refine fields based on TAX response
   [key: string]: unknown;
}

export interface TaxSsnResponse {
   error?: {
      errorcode: string;
      errortext: string;
   };
   taxPayerInfo?: TaxPayerInfoItem[];
   [key: string]: unknown;
}

export interface TaxPayerInfoItem {
   taxpayerid: string;
   taxpayerName?: string;
   legalTypeCode?: string;
   legalTypeName?: string;
   personInfoPeriods: {
      personInfoPeriod: PersonInfoPeriodItem[];
   };
}

export interface PersonInfoPeriodItem {
   date: string;
   personInfo: {
      incomeTax: number;
      workinghours: number;
      socialpayments: number;
      socialpaymentspaid: number;
      salaryEquivPayments: number;
      civilLowContractPayments: number;
   };
}
