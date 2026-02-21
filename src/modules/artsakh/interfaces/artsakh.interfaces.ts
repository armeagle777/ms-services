export interface DisplacementCase {
  // TODO: refine fields based on Artsakh DB query
  [key: string]: unknown;
}

export interface DisplacementCertificate {
  // TODO: refine fields based on Artsakh DB query
  [key: string]: unknown;
}

export interface DisplacementResponse {
  cases: DisplacementCase[];
  certificates: DisplacementCertificate[];
}
