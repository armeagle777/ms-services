export interface StatisticsRow {
  // TODO: refine fields based on query results
  [key: string]: unknown;
}

export interface StatisticsPeriodOption {
  label: string;
  value: number | string;
  key: number | string;
}
