import { ConflictException, Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Long } from '@grpc/proto-loader';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  CreateGameRequest,
  CreateGameResponse,
  FindAllRequest,
  FindAllResponse,
  FindByAddressRequest,
  FindByAddressResponse,
  UpdateGameRequest,
  UpdateGameResponse,
} from './games-directory.interface';
import { GamesDirectoryService } from '../repository/games-directory';
import { TotemGamesDirectory } from '../contracts/games-directory/totem-games-directory';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class GamesDirectoryController {
  constructor(private repository: GamesDirectoryService, private contract: TotemGamesDirectory) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'Create')
  async create(request: CreateGameRequest): Promise<CreateGameResponse> {
    const isExists = await this.repository.isExists(request.gameAddress);
    if (isExists) {
      throw new ConflictException('game address is already exists');
    }
    const txHash = await this.contract.create(request);
    return { txHash };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'Update')
  async update(request: UpdateGameRequest): Promise<UpdateGameResponse> {
    const txHash = await this.contract.update(request);
    return { txHash };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'FindAll')
  async findAll(request: FindAllRequest): Promise<FindAllResponse> {
    const { total, offset, limit, results } = await this.repository.findAll({
      filters: request.filters,
      limit: request.limit.toNumber(),
      offset: request.offset.toNumber(),
    });
    return {
      total: Long.fromNumber(total),
      limit: Long.fromNumber(limit),
      offset: Long.fromNumber(offset),
      results: results.map((record) => ({
        ...record,
        createdAt: Long.fromNumber(record.createdAt),
        updatedAt: Long.fromNumber(record.updatedAt),
      })),
    };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'FindByAddress')
  async findById(request: FindByAddressRequest): Promise<FindByAddressResponse> {
    const record = await this.repository.findByAddress(request);
    return {
      record: {
        ...record,
        createdAt: Long.fromNumber(record.createdAt),
        updatedAt: Long.fromNumber(record.updatedAt),
      },
    };
  }
}
