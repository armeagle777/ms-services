import { Inject, Injectable } from '@nestjs/common';
import { Sequelize,  QueryTypes} from 'sequelize';

import { WP_SEQUELIZE } from './wp.tokens';
import {
  getWpQuery,
  getEatmQuery,
  getEatmFamilyMemberQuery,
  extractData,
  filterWpPersonsQuery,
  getFullInfoBaseQuery,
  getFinesQuery,
  formatBaseResult,
  getClaimsQuery,
  getCardsQuery,
  getFamilyMemberQuery,
} from './wp.helpers';
import { TABLE_NAMES } from './wp.constants';
import { FilterWpPersonsDto, WpPersonFullInfoDto } from './dto/wp.dto';
import {
  PaginatedResponse,
  WpCountry,
  WpDataResponse,
  WpPersonFullInfoResponse,
} from './interfaces/wp.interfaces';

@Injectable()
export class WpService {
  constructor(@Inject(WP_SEQUELIZE) private readonly sequelize: Sequelize) {}

  async getWpData(pnum: string): Promise<WpDataResponse> {
    const wpResponse = await this.sequelize.query(getWpQuery(pnum), {
      type: QueryTypes.SELECT,
    });

    const eatmResponse = await this.sequelize.query(getEatmQuery(pnum), {
      type: QueryTypes.SELECT,
    });

    const eatmFamilyResponse = await this.sequelize.query(getEatmFamilyMemberQuery(pnum), {
      type: QueryTypes.SELECT,
    });

    const { cards: wpCards, data: wpData } = extractData(wpResponse as any[]);
    const { cards: eatmCards, data: eatmData } = extractData(eatmResponse as any[]);
    const { cards: eatmFamilyCards, data: eatmFamilyData } = extractData(
      eatmFamilyResponse as any[],
    );

    return {
      wpData,
      eatmData,
      eatmFamilyData,
      cards: [...wpCards, ...eatmCards, ...eatmFamilyCards],
    };
  }

  async getWpCountries(): Promise<WpCountry[]> {
    const query = 'SELECT * FROM countries';
    const countries = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return countries as WpCountry[];
  }

  async filterWpPersons(
    body: FilterWpPersonsDto,
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    const { page = 1, pageSize = 10, filters = {} } = body || {};

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const countSubQuery = filterWpPersonsQuery(filters);
    const query = `${countSubQuery} LIMIT :limit OFFSET :offset`;

    const countResult = await this.sequelize.query(countSubQuery, {
      type: QueryTypes.SELECT,
    });

    const total = (countResult as any[])?.length || 0;

    const persons = await this.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { limit, offset },
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: persons as any[],
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getWpPersonFullInfo(
    id: string,
    body: WpPersonFullInfoDto,
  ): Promise<WpPersonFullInfoResponse> {
    const { tablename: procedure, user_id } = body || {};

    const queries = [
      { key: 'baseInfo', query: getFullInfoBaseQuery(procedure, id) },
      { key: 'fines', query: getFinesQuery(procedure, id) },
      { key: 'claims', query: getClaimsQuery(procedure, id) },
      { key: 'cards', query: getCardsQuery(procedure, id) },
      ...(procedure === TABLE_NAMES.EAEU
        ? [
            {
              key: 'familyMembers',
              query: getFamilyMemberQuery(procedure, user_id),
            },
          ]
        : []),
    ];

    const resultsArray = await Promise.all(
      queries.map((q) => this.sequelize.query(q.query, { type: QueryTypes.SELECT })),
    );

    const results: Record<string, unknown> = {};
    queries.forEach((q, i) => {
      results[q.key] = q.key === 'baseInfo' ? formatBaseResult(resultsArray[i]) : resultsArray[i];
    });

    return results as WpPersonFullInfoResponse;
  }
}
