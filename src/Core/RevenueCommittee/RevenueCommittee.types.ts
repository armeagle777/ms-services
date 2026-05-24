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

export interface GetTaxInfoResponse {
   PNum?: string;
   Full_Name?: string;
   EmployerInfo?: FilteredEmployerInfoItem[];
   Series_Number?: string;
   Document_Type_Name?: string;
   [key: string]: unknown;
}

export type FilteredEmployerInfoItem = Omit<
   EmployerInfoItem,
   'Salary' | 'Benefit' | 'Net_income' | 'Contract_revenue'
>;

export interface EmployerInfoItem {
   TIN?: string;
   Salary?: MoneyAmount;
   Address?: string;
   Benefit?: MoneyAmount;
   TP_NAME?: string;
   Net_income?: MoneyAmount;
   PositionInfo?: PositionInfoItem[];
   Contract_revenue?: MoneyAmount;
}

export interface MoneyAmount {
   sum?: string;
   currency?: string;
}

export interface PositionInfoItem {
   Position?: string;
   Position_ID?: string;
   Position_End_Date?: string;
   Position_Start_Date?: string;
   Civil_relations_EndDate?: string;
   Civil_relations_StartDate?: string;
}
