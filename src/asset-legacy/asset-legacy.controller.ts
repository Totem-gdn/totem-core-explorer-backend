import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Long } from '@grpc/proto-loader';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  CreateAssetLegacyRequest,
  CreateAssetLegacyResponse,
  FindAllRequest,
  FindAllResponse,
  FindByIdRequest,
  FindByIdResponse,
} from './asset-legacy.interface';
import { AssetLegacyService } from '../repository/asset-legacy';
import { TotemAssetLegacy } from '../contracts/asset-legacy/totem-asset-legacy';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class AssetLegacyController {
  constructor(private repository: AssetLegacyService, private contract: TotemAssetLegacy) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('AssetLegacy', 'Create')
  async create(request: CreateAssetLegacyRequest): Promise<CreateAssetLegacyResponse> {
    const { assetType, ...record } = request;
    const txHash = await this.contract.create(assetType, record);
    return { txHash };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('AssetLegacy', 'FindAll')
  async findAll(request: FindAllRequest): Promise<FindAllResponse> {
    const { total, offset, limit, results } = await this.repository.findAll({
      assetType: request.assetType,
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

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('AssetLegacy', 'FindById')
  async findById(request: FindByIdRequest): Promise<FindByIdResponse> {
    const record = await this.repository.findById(request);
    return {
      record: {
        ...record,
        timestamp: Long.fromNumber(record.timestamp),
      },
    };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('AssetLegacy', 'GamesStatistics')
  async statistics({ gameAddress }) {
    const res = await this.repository.countAssetsForGames(gameAddress);
    return res;
  }
}
