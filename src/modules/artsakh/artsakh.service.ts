import { Inject, Injectable } from '@nestjs/common';
import { Sequelize ,QueryTypes} from 'sequelize';

import { ARTSAKH_SEQUELIZE } from './artsakh.tokens';
import { getDisplacementCasesQuery, getDisplacementCertsQuery } from './artsakh.queries';
import { DisplacementResponse } from './interfaces/artsakh.interfaces';

@Injectable()
export class ArtsakhService {
  constructor(@Inject(ARTSAKH_SEQUELIZE) private readonly sequelize: Sequelize) {}

  async getDisplacementData(pnum: string): Promise<DisplacementResponse> {
    const cases = await this.sequelize.query(getDisplacementCasesQuery(pnum), {
      type: QueryTypes.SELECT,
    });

    const certificates = await this.sequelize.query(getDisplacementCertsQuery(pnum), {
      type: QueryTypes.SELECT,
    });

    return {
      cases: cases as any[],
      certificates: certificates as any[],
    };
  }
}
