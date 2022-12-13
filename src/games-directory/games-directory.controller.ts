import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import { CreateGameRequest, CreateGameResponse } from './games-directory.interface';
import { GamesDirectoryService } from '../repository/games-directory';
import { TotemGamesDirectory } from '../contracts/games-directory/totem-games-directory';

@Controller()
export class GamesDirectoryController {
  constructor(private repository: GamesDirectoryService, private contract: TotemGamesDirectory) {}

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'Create')
  async create(request: CreateGameRequest): Promise<CreateGameResponse> {
    const { owner, status, ...game } = request;
    const txHash = await this.contract.create({ owner, game, status });
    return { txHash };
  }
}
