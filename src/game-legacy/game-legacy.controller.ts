import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Long } from '@grpc/proto-loader';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  CreateGameLegacyRequest,
  CreateGameLegacyResponse,
  FindAllRequest,
  FindAllResponse,
  FindByIdRequest,
  FindByIdResponse,
} from './game-legacy.interface';
import { GameLegacyService } from '../repository/game-legacy';
import { TotemGameLegacy } from '../contracts/game-lagecy/totem-game-legacy';

@Controller()
export class GameLegacyController {
  constructor(private repository: GameLegacyService, private contract: TotemGameLegacy) {}

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GameLegacy', 'Create')
  async create(request: CreateGameLegacyRequest): Promise<CreateGameLegacyResponse> {
    const txHash = await this.contract.create(request);
    return { txHash };
  }

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GameLegacy', 'FindAll')
  async findAll(request: FindAllRequest): Promise<FindAllResponse> {
    const { total, offset, limit, results } = await this.repository.findAll({
      filters: request.filters,
      limit: request.limit.toNumber(),
      offset: request.offset.toNumber(),
    });
    return {
      total: Long.fromNumber(total),
      offset: Long.fromNumber(offset),
      limit: Long.fromNumber(limit),
      results: results.map((record) => ({
        ...record,
        timestamp: Long.fromNumber(record.timestamp),
      })),
    };
  }

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GameLegacy', 'FindById')
  async findById(request: FindByIdRequest): Promise<FindByIdResponse> {
    const record = await this.repository.findById(request);
    return {
      record: {
        ...record,
        timestamp: Long.fromNumber(record.timestamp),
      },
    };
  }
}
