export interface IRefugeeFamilyMemberModel {
   personal_id: number;
   case_id: number;
   f_name_arm: string;
   f_name_eng: string;
   l_name_arm: string;
   l_name_eng: string;
   m_name_arm: string;
   m_name_eng: string;
   b_day: string;
   b_month: string;
   b_year: string;
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
   image: string;
   ROLE_NAME: string;
}
