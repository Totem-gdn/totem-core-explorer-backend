import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Long } from '@grpc/proto-loader';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  CreateGameRequest,
  CreateGameResponse,
  FindAllRequest,
  FindAllResponse,
  FindByIdRequest,
  FindByIdResponse,
  UpdateGameRequest,
  UpdateGameResponse,
} from './games-directory.interface';
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

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'Update')
  async update(request: UpdateGameRequest): Promise<UpdateGameResponse> {
    const result: UpdateGameResponse = {};
    const { recordId, ...updateFields } = request;
    for (const field in updateFields) {
      if (updateFields[field] !== null && updateFields[field] !== undefined) {
        result[`${field}TxHash`] = await this.contract.update({ recordId, field, data: updateFields[field] });
      }
    }
    return result;
  }

  @UseFilters(UnhandledExceptionFilter)
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

  @UseFilters(UnhandledExceptionFilter)
  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('GamesDirectory', 'FindById')
  async findById(request: FindByIdRequest): Promise<FindByIdResponse> {
    const record = await this.repository.findById(request);
    return {
      record: {
        ...record,
        createdAt: Long.fromNumber(record.createdAt),
        updatedAt: Long.fromNumber(record.updatedAt),
      },
    };
  }
}
