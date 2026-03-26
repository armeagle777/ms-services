import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';

import { getDisplacementCasesQuery, getDisplacementCertsQuery } from './Queries';
import { DisplacementResponse } from 'src/Core/Artsakh/interfaces/artsakh.interfaces';
import { ARTSAKH_CONNECTION } from 'src/Infrustructure/Database/database.tokens';

@Injectable()
export class ArtsakhService {
   constructor(@Inject(ARTSAKH_CONNECTION) private readonly artsakhDb: Sequelize) {}

   async getDisplacementData(pnum: string): Promise<DisplacementResponse> {
      const [cases] = await this.artsakhDb.query(getDisplacementCasesQuery(pnum));

      const [certificates] = await this.artsakhDb.query(getDisplacementCertsQuery(pnum));

      return {
         cases: cases as any[],
         certificates: certificates as any[],
      };
   }
}
