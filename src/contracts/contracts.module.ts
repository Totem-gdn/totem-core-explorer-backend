import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RepositoryModule } from '../repository/repository.module';
import { ProviderService } from './provider/provider.service';
import { TotemAssetLegacy } from './asset-legacy/totem-asset-legacy';
import { TotemGameLegacy } from './game-lagecy/totem-game-legacy';
import { TotemGamesDirectory } from './games-directory/totem-games-directory';

@Module({
  imports: [ConfigModule, RepositoryModule],
  providers: [ProviderService, TotemAssetLegacy, TotemGameLegacy, TotemGamesDirectory],
  exports: [TotemAssetLegacy, TotemGameLegacy, TotemGamesDirectory],
})
export class ContractsModule {}
