import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [ConfigModule, RepositoryModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
