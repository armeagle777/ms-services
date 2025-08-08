import { WorkerTbNamesEnum } from '../../Shared/Enums';

export interface IWorkPermitEaeuClaim {
   id: number;
   eaeu_employee_id: number;
   created_at: string;
   status: unknown;
   type: unknown;
   officer_name: string;
   officer_last_name: string;
   action: unknown;
   log_created_at: string;
   send_number: unknown;
}
export interface IWorkPermitFamilyClaim {
   id: number;
   eaeu_employee_family_member_id: number;
   created_at: string;
   status: unknown;
   type: unknown;
   officer_name: string;
   officer_last_name: string;
   action: unknown;
   log_created_at: string;
   send_number: string;
}
export interface IWorkPermitEmployeeClaim {
   id: number;
   employee_id: number;
   created_at: string;
   status: unknown;
   type: unknown;
   officer_name: string;
   officer_last_name: string;
   action: unknown;
   log_created_at: string;
   send_number: unknown;
}

export interface ITableResultsMap {
   [WorkerTbNamesEnum.EAEU]: IWorkPermitEaeuClaim;
   [WorkerTbNamesEnum.FAMILY]: IWorkPermitFamilyClaim;
   [WorkerTbNamesEnum.EMPLOYEE]: IWorkPermitEmployeeClaim;
}
