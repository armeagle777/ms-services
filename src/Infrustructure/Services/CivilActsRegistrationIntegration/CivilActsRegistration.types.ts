export interface CivilActsRegistrationRequest {
   ssn: string;
   firstName: string;
   lastName: string;
}

export type CivilActDocumentType =
   | 'birth'
   | 'paternity'
   | 'marriage'
   | 'divorce'
   | 'death'
   | (string & {});

export interface CivilActBaseInfo {
   last_name: string;
   name: string;
   fathers_name: string;
   birth_date: string;
   nationality: string;
}

export interface CivilActAddress {
   country: string;
   region?: string;
   community?: string;
   residence?: string;
   street?: string;
   house_type?: string;
   house?: string;
   apartment?: string;
   start_date?: string;
   department?: string;
}

export interface CivilActAttachedAct {
   registration_date?: string;
   certificate_number?: string;
   registration_office?: string;
   registration_number?: string;
}

export interface CivilActPerson {
   psn: string;
   id_type?: string;
   id_number?: string;
   citizenship?: string;
   id_department?: string;
   id_issue_date?: string;
   id_expirey_date?: string;
   base_info: CivilActBaseInfo;
   new_last_name?: string;
   gender?: string;
   visa_number?: string;
   visa_department?: string;
   birth?: CivilActAddress;
   resident?: CivilActAddress;
   current?: CivilActAddress;
   education_level?: string;
   employment_status?: string;
   marital_status?: string;
   marriage_number?: string;
   attached_act?: CivilActAttachedAct;
   paternity_base?: string;
   paternity_base_obj?: Record<string, unknown>;
   [key: string]: unknown;
}

export interface CivilActChild {
   psn: string;
   base_info?: CivilActBaseInfo;
   gender?: string;
   count_children?: string;
   child_number?: string;
   birth_status?: string;
   birth?: CivilActAddress;
   resident?: CivilActAddress;
   [key: string]: unknown;
}

export interface CivilActMedicalDocument {
   institution_name?: string;
   document_name?: string;
   document_number?: string;
   document_date?: string;
   [key: string]: unknown;
}

export interface CivilActDocument {
   full_ref_num: string;
   type: CivilActDocumentType;
   ref_num: number;
   registered: string;
   office_name: string;
   cert_num: string;
   cert_date: string;
   tracking_id: string;
   presenter?: CivilActPerson;
   person?: CivilActPerson;
   event_date: string;
   form: number;
   med?: CivilActMedicalDocument;
   person2?: CivilActPerson;
   child?: CivilActChild;
   children?: string | CivilActChild[];
   [key: string]: unknown;
}

export interface CivilActsRegistrationResponse {
   status: 'ok' | 'failed' | (string & {});
   code: string;
   result: Record<string, CivilActDocument>;
}
