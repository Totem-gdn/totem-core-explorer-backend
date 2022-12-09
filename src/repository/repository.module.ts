import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AssetLegacy,
  AssetLegacySchema,
  AvatarLegacy,
  AvatarLegacySchema,
  GameLegacy,
  GameLegacySchema,
  GamesDirectory,
  GamesDirectorySchema,
  GemLegacy,
  GemLegacySchema,
} from './schemas';
import { AssetLegacyService } from './asset-legacy';
import { GameLegacyService } from './game-legacy';
import { GamesDirectoryService } from './games-directory';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: AvatarLegacy.name, schema: AvatarLegacySchema },
      { name: AssetLegacy.name, schema: AssetLegacySchema },
      { name: GemLegacy.name, schema: GemLegacySchema },
      { name: GameLegacy.name, schema: GameLegacySchema },
      { name: GamesDirectory.name, schema: GamesDirectorySchema },
    ]),
  ],
  providers: [AssetLegacyService, GameLegacyService, GamesDirectoryService],
  exports: [AssetLegacyService, GameLegacyService, GamesDirectoryService],
})
export class RepositoryModule {}
