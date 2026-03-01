export class FilterWpPersonsDto {
  page?: number;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

export class WpPersonFullInfoDto {
  tablename!: string;
  user_id!: string | number;
}
