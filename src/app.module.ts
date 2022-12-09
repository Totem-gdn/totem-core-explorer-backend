import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { HealthModule } from './health/health.module';
import { RepositoryModule } from './repository/repository.module';
import { ContractsModule } from './contracts/contracts.module';
import { AssetLegacyModule } from './asset-legacy/asset-legacy.module';
import { GameLegacyModule } from './game-legacy/game-legacy.module';
import { GamesDirectoryModule } from './games-directory/games-directory.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: config.get<string>('MONGODB_DATABASE'),
      }),
    }),
    HealthModule,
    RepositoryModule,
    ContractsModule,
    AssetLegacyModule,
    GameLegacyModule,
    GamesDirectoryModule,
  ],
})
export class AppModule {}
