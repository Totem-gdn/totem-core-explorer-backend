import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { ContractsModule } from '../contracts/contracts.module';
import { AssetLegacyController } from './asset-legacy.controller';

@Module({
  imports: [ConfigModule, RepositoryModule, ContractsModule],
  controllers: [AssetLegacyController],
})
export class AssetLegacyModule {}
