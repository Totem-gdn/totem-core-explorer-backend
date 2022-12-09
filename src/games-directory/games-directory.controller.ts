import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import { CreateGameRequest, Empty } from './games-directory.interface';
import { GamesDirectoryService } from '../repository/games-directory';
import { TotemGamesDirectory } from '../contracts/games-directory/totem-games-directory';

@Controller()
export class GamesDirectoryController {
  constructor(private repository: GamesDirectoryService, private contract: TotemGamesDirectory) {}

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'Create')
  async create(request: CreateGameRequest): Promise<Empty> {
    const { owner, status, ...game } = request;
    await this.contract.create({ owner, game, status });
    return {};
  }
}
