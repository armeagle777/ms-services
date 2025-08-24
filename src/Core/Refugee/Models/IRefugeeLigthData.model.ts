export interface IRefugeeLightDataModel {
   personal_id: number;
   case_id: number;
   doc_num: string | null;
   f_name_arm: string;
   f_name_eng: string;
   l_name_arm: string;
   l_name_eng: string;
   m_name_arm: string | null;
   m_name_eng: string | null;
   b_day: string | null;
   b_month: string | null;
   b_year: string | null;
   sex: number;
   religion: number;
   invalid: number;
   pregnant: number;
   seriously_ill: number;
   trafficking_victim: number;
   violence_victim: number;
   comment: string;
   illegal_border: number;
   transfer_moj: number;
   deport_prescurator: number;
   prison: number;
   role: number;
   image: string | null;
   ROLE_NAME: string;
}
