export interface WpCardInfo {
  // TODO: refine card fields
  [key: string]: unknown;
}

export interface WpDataResponse {
  wpData: unknown[] | null;
  eatmData: unknown[] | null;
  eatmFamilyData: unknown[] | null;
  cards: WpCardInfo[];
}

export interface WpCountry {
  // TODO: refine country fields
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface WpPersonFullInfoResponse {
  // TODO: refine response fields
  [key: string]: unknown;
}
