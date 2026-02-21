import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './API/APIModule';
import { DatabaseModule } from './Infrustructure/Database/Database.module';
import { PersonsModule } from './modules/persons/persons.module';
import { PetregistrModule } from './modules/petregistr/petregistr.module';
import { KadastrModule } from './modules/kadastr/kadastr.module';
import { ArtsakhModule } from './modules/artsakh/artsakh.module';
import { WpModule } from './modules/wp/wp.module';
import { MojCesModule } from './modules/moj-ces/moj-ces.module';
import { TaxModule } from './modules/tax/tax.module';
import { SphereModule } from './modules/sphere/sphere.module';
import { McsModule } from './modules/mcs/mcs.module';
import { EsignModule } from './modules/esign/esign.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      APIModule,
      DatabaseModule,
      PersonsModule,
      PetregistrModule,
      KadastrModule,
      ArtsakhModule,
      WpModule,
      MojCesModule,
      TaxModule,
      SphereModule,
      McsModule,
      EsignModule,
      StatisticsModule,
   ],
   controllers: [],
   providers: [],
})
export class AppModule {}
