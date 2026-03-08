export type SoapCallResult = {
   status: number;
   xml: string;
   requestXml: string;
};

export type BasicFields = {
   resultCode: string | null;
   resultOtherCode: string | null;
   requestId: string | null;
};

export type KnownResultCodeKey =
   | 'NO_ERROR'
   | 'NO_ANSWER'
   | 'INVALID_SEARCH_ERROR'
   | 'UNEXPECTED_ERROR'
   | 'TOO_MANY_ANSWER'
   | 'ACCESS_DENIED'
   | 'OTHER_ERROR_CODE'
   | 'TIME_OUT';

export type ResultCodeKey = KnownResultCodeKey | 'UNKNOWN';

export type ResultCodeMeta = {
   key: ResultCodeKey;
   numericValue: number | null;
   description: string;
   retryable: boolean;
   requiresQueryRefinement: boolean;
   accessDenied: boolean;
   isKnown: boolean;
};

export type BaseResponse = {
   ok: boolean;
   httpStatus: number;
   fault: string | null;
   resultCode: string | null;
   resultOtherCode: string | null;
   requestId: string | null;
   resultCodeMeta: ResultCodeMeta;
   raw: string;
   request: string;
};

export type SearchHit = {
   item_id: string;
   name: string;
   forename: string;
   dob: string;
   caution: string;
   score: string;
   owner_office_id: string;
};

export type DetailFields = {
   item_id_short: string;
   name: string;
   forename: string;
   dob: string;
   sex_id: string;
   owner_office_id: string;
   db_last_updated_on: string;
   caution_id: string;
};

export type DetailRef = {
   type_id: string;
   ref: string;
   language_id: string;
};

export type DetailsPayload = {
   fields: Partial<DetailFields>;
   refs: DetailRef[];
};

export type InterpolSearchResponse = BaseResponse & {
   hits: SearchHit[];
};

export type InterpolDetailsResponse = BaseResponse & {
   details: DetailsPayload | null;
};

export type InterpolFile = {
   fileName: string;
   type: string;
   binData: string;
};

export type InterpolFileResponse = BaseResponse & {
   files: InterpolFile[];
};

export type InterpolSltdSearchResponse = BaseResponse & {
   xmlData: string;
};

export type InterpolSltdDetailsResponse = BaseResponse & {
   xmlData: string;
};
