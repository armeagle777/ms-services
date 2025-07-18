import { Module } from '@nestjs/common';

import { TestController } from './Controllers';

@Module({
  imports: [],
  controllers: [TestController],
  providers: [],
})
export class APIModule {}
