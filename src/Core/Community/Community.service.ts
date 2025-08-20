import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { FindAllQuery } from './Queries';
import { SequelizeSelectOptions } from '../Shared/Constants/Sequielize.constants';
import { CommunityModel } from './Models';

@Injectable()
export class CommunityService {
   constructor(@Inject('ASYLUM_CONNECTION') private readonly asylumDb: Sequelize) {}

   async findAll(): Promise<Partial<CommunityModel>[]> {
      return this.asylumDb.query<CommunityModel>(FindAllQuery, SequelizeSelectOptions);
   }
}
