export class AsylumStatsRequestDto {
  year?: number | string;
  period?: string;
  month?: number | string;
  decType?: string;
}

export class BorderCrossStatsRequestDto {
  year?: number | string;
  period?: string;
  month?: number | string;
  borderCross?: string;
}

export class WpSimpleStatsRequestDto {
  wp_type?: string;
  decType?: string;
  report_type?: number;
  year?: number | string;
  period?: string;
  month?: number | string;
  claim_type?: string;
}

export class ExportStatsRequestDto {
  filters!: Record<string, unknown> & { statisticsType: string };
}
