import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { RepositoryModule } from '../repository/repository.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

@Module({
  imports: [ConfigModule, HttpModule, RepositoryModule],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}
