export interface EsignFindUserResponse {
  exists: boolean;
  canSign?: boolean;
  username?: string | null;
  caName?: string | null;
  certificateProfileName?: string | null;
  endEntityProfileName?: string | null;
  subjectDN?: string | null;
  tokenType?: string | null;
  clearPwd?: boolean;
  keyRecoverable?: boolean;
  sendNotification?: boolean;
  statusCode?: number;
  status?: string;
  revocationReasonCode?: number | null;
  revocationReason?: string | null;
  extendedInformation?: unknown[];
  extendedMap?: Record<string, unknown>;
  raw?: unknown;
}

export interface EsignEditUserResponse {
  password: string;
  data: unknown;
}

export interface EsignRevokeResponse {
  // TODO: refine fields based on revoke response
  [key: string]: unknown;
}
