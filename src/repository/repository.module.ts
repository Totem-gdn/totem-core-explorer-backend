import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import { GamesDirectory, GamesDirectorySchema, GamesDirectoryService } from './games-directory';
import {
  AssetLegacyService,
  AvatarLegacy,
  AvatarLegacySchema,
  GemLegacy,
  GemLegacySchema,
  ItemLegacy,
  ItemLegacySchema,
} from './asset-legacy';
import { Publisher, PublisherSchema, PublishersService } from './publishers';
import { GameLegacy, GameLegacySchema, GameLegacyService } from './game-legacy';
import { PaymentKey, PaymentKeySchema, PaymentKeysService } from './payment-keys';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: AvatarLegacy.name, schema: AvatarLegacySchema },
      { name: ItemLegacy.name, schema: ItemLegacySchema },
      { name: GemLegacy.name, schema: GemLegacySchema },
      { name: GameLegacy.name, schema: GameLegacySchema },
      { name: GamesDirectory.name, schema: GamesDirectorySchema },
      { name: Publisher.name, schema: PublisherSchema },
      { name: PaymentKey.name, schema: PaymentKeySchema },
    ]),
  ],
  providers: [AssetLegacyService, GameLegacyService, GamesDirectoryService, PublishersService, PaymentKeysService],
  exports: [AssetLegacyService, GameLegacyService, GamesDirectoryService, PublishersService, PaymentKeysService],
})
export class RepositoryModule {}
