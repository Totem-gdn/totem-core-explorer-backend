import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { PaymentKeysController } from './payment-keys.controller';

@Module({
  imports: [ConfigModule, RepositoryModule],
  controllers: [PaymentKeysController],
})
export class PaymentKeysModule {}
