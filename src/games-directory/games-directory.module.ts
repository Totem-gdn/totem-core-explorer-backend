import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { GamesDirectoryController } from './games-directory.controller';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [ConfigModule, RepositoryModule, ContractsModule],
  controllers: [GamesDirectoryController],
})
export class GamesDirectoryModule {}
