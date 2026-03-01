export class CreateEsignProfileDto {
  userData!: {
    first_name_en?: string;
    last_name_en?: string;
    ssn?: string;
    first_name_am?: string;
    last_name_am?: string;
    [key: string]: unknown;
  };
  isRaCitizen?: boolean;
}

export class RevokeEsignProfileDto {
  ssn!: string;
  reasonCode?: number;
  deleteUser?: number;
}
