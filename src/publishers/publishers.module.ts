import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { PublishersController } from './publishers.controller';

@Module({
  imports: [ConfigModule, RepositoryModule],
  controllers: [PublishersController],
})
export class PublishersModule {}
