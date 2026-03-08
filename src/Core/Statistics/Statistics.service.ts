import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { Sequelize, QueryTypes } from 'sequelize';
import * as crypto from 'crypto';

import { decTypeTableNameMap, statByYearQuery } from 'src/Core/Statistics/statistics.constants';
import {
   formatAsylumQuery,
   formatTotalAsylumQuery,
   formatTotalBorderCrossQuery,
   formatPeriodBorderCrossQuery,
   formatCountryBorderCrossQuery,
   formatEaeuEmployeeApplicationsQuery,
   formatEaeuEmployeeDecisionsQuery,
   formatEaeuEmployeeFamApplicationsQuery,
   formatEaeuEmployeeFamDecisionsQuery,
   formatWpApplicationsQuery,
   formatWpDecisionsQuery,
   formatVolunteerApplicationsQuery,
   // formatEaeuOfficialQuery,
   // formatEaeuEmployeeFamOfficialQuery,
   // formatWpOfficialQuery,
   formatStatisticsPeriodsQuery,
   formatVolunteerDecisionsQuery,
} from 'src/Core/Statistics/statistics.helpers';
import {
   AsylumStatsRequestDto,
   BorderCrossStatsRequestDto,
   // ExportStatsRequestDto,
   WpSimpleStatsRequestDto,
} from 'src/API/DTO/Statistics/statistics.dto';
import {
   SAHMANAHATUM_SEQUELIZE,
   STATISTICS_SEQUELIZE,
   WP_SEQUELIZE,
} from 'src/Core/Statistics/statistics.tokens';
import {
   StatisticsPeriodOption,
   StatisticsRow,
} from 'src/Core/Statistics/interfaces/statistics.interfaces';

@Injectable()
export class StatisticsService {
   constructor(
      @Inject(STATISTICS_SEQUELIZE) private readonly statisticsSequelize: Sequelize,
      @Inject(SAHMANAHATUM_SEQUELIZE) private readonly sahmanahatumSequelize: Sequelize,
      @Inject(WP_SEQUELIZE) private readonly wpSequelize: Sequelize,
   ) {}

   async getAsylumTotal({ year, period, month }: AsylumStatsRequestDto): Promise<StatisticsRow[]> {
      const query = formatTotalAsylumQuery({ year, month, period });
      const statData = await this.statisticsSequelize.query(query, {
         type: QueryTypes.SELECT,
      });
      return statData as StatisticsRow[];
   }

   async getAsylumApplications({ year, period, month }: AsylumStatsRequestDto) {
      const query = formatAsylumQuery({
         table_name: 'applied_for_asylum',
         year,
         month,
         period,
      });

      const statData = await this.statisticsSequelize.query(query, {
         type: QueryTypes.SELECT,
      });
      return statData as StatisticsRow[];
   }

   async getAsylumDecisions({ year, period, decType, month }: AsylumStatsRequestDto) {
      const query = formatAsylumQuery({
         table_name: decTypeTableNameMap[decType as any],
         year,
         month,
         period,
      });

      const statData = await this.statisticsSequelize.query(query, {
         type: QueryTypes.SELECT,
      });
      return statData as StatisticsRow[];
   }

   async getAsylumYears(): Promise<StatisticsRow[]> {
      const statData = await this.statisticsSequelize.query(statByYearQuery, {
         type: QueryTypes.SELECT,
      });

      return (statData as any[]).map((row) => ({
         ...row,
         period_year: String(row.period_year),
         key: row.period_year,
      }));
   }

   async uploadBorderCrossFile() {
      // _body: Record<string, unknown>
      throw new NotImplementedException('File upload logic is not migrated.');
   }

   async getBorderCrossTotal({ year, period, month, borderCross }: BorderCrossStatsRequestDto) {
      const query = formatTotalBorderCrossQuery({ year, month, period, borderCross });
      const statData = await this.sahmanahatumSequelize.query(query, {
         type: QueryTypes.SELECT,
      });

      return (statData as any[]).map((item) =>
         Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, isNaN(value as any) ? value : +value]),
         ),
      );
   }

   async getBorderCrossCountries({ year, period, month }: BorderCrossStatsRequestDto) {
      const query = formatCountryBorderCrossQuery({ year, month, period });
      const statData = await this.sahmanahatumSequelize.query(query, {
         type: QueryTypes.SELECT,
      });

      return (statData as any[]).map((item) =>
         Object.fromEntries(
            Object.entries(item).map(([key, value]) => [key, isNaN(value as any) ? value : +value]),
         ),
      );
   }

   async getBorderCrossPeriods({ year, period, month }: BorderCrossStatsRequestDto) {
      const query = formatPeriodBorderCrossQuery({ year, month, period });
      const statData = await this.sahmanahatumSequelize.query(query, {
         type: QueryTypes.SELECT,
      });

      return (statData as any[]).map((item) =>
         Object.fromEntries(
            Object.entries(item).map(([key, value]) => [
               key,
               key === 'main_column' || isNaN(value as any) ? String(value) : +value,
            ]),
         ),
      );
   }

   async getSimpleWPStatistics(body: WpSimpleStatsRequestDto) {
      const { year, month, period, wp_type, claim_type, report_type, decType } = body || {};

      let query: string | null = null;

      switch (wp_type) {
         case 'eaeu_employee':
            query =
               report_type === 1
                  ? formatEaeuEmployeeApplicationsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       //   decType,
                    })
                  : formatEaeuEmployeeDecisionsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       decType,
                    });
            break;
         case 'eaeu_employee_family':
            query =
               report_type === 1
                  ? formatEaeuEmployeeFamApplicationsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       //   decType,
                    })
                  : formatEaeuEmployeeFamDecisionsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       decType,
                    });
            break;
         case 'work_permit':
            query =
               report_type === 1
                  ? formatWpApplicationsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       //   decType,
                    })
                  : formatWpDecisionsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       decType,
                    });
            break;
         case 'volunteer':
            query =
               report_type === 1
                  ? formatVolunteerApplicationsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       //   decType,
                    })
                  : formatVolunteerDecisionsQuery({
                       year,
                       month,
                       period,
                       claim_type,
                       //   report_type,
                       decType,
                    });
            break;
         default:
            return null;
      }

      const statData = await this.wpSequelize.query(query, {
         type: QueryTypes.SELECT,
      });

      return (statData as any[])?.map((row) => ({ ...row, key: crypto.randomUUID() }));
   }

   async exportExcel() {
      // _body: ExportStatsRequestDto
      throw new NotImplementedException('File export logic is not migrated.');
   }

   async exportPdf() {
      // _body: ExportStatsRequestDto
      throw new NotImplementedException('File export logic is not migrated.');
   }

   async getStatisticsPeriodsData(statisticsType: string): Promise<StatisticsPeriodOption[]> {
      const query = formatStatisticsPeriodsQuery(statisticsType);
      const sequelizeClient =
         statisticsType === 'asylum'
            ? this.statisticsSequelize
            : statisticsType === 'sahmanahatum'
              ? this.sahmanahatumSequelize
              : this.wpSequelize;

      const periodsData = await sequelizeClient.query(query, {
         type: QueryTypes.SELECT,
      });

      return (periodsData as any[]).map(({ Year }) => ({
         label: `${Year}`,
         value: Year,
         key: Year,
      }));
   }
}
