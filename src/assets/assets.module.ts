import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { ContractsModule } from '../contracts/contracts.module';
import { AssetsController } from './assets.controller';

@Module({
  imports: [ConfigModule, RepositoryModule, ContractsModule],
  controllers: [AssetsController],
})
export class AssetsModule {}
