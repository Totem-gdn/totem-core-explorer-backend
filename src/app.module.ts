import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { MongooseModule } from '@nestjs/mongoose';

import { HealthModule } from './health/health.module';
import { RepositoryModule } from './repository/repository.module';
import { ContractsModule } from './contracts/contracts.module';
import { AssetLegacyModule } from './asset-legacy/asset-legacy.module';
import { GameLegacyModule } from './game-legacy/game-legacy.module';
import { GamesDirectoryModule } from './games-directory/games-directory.module';
import { PublishersModule } from './publishers/publishers.module';
import { PaymentKeysModule } from './payment-keys/payment-keys.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          url: config.get<string>('REDIS_URL'),
        },
      }),
    }),
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
    PublishersModule,
    PaymentKeysModule,
    PaymentsModule,
  ],
})
export class AppModule {}
