import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  ClaimRequest,
  ClaimResponse,
  CreateRequest,
  InfoRequest,
  InfoResponse,
  UpdateRequest,
} from './assets.interface';
import { AssetsService } from '../repository/assets';
import { TotemAsset } from '../contracts/asset/totem-asset';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class AssetsController {
  constructor(private readonly repository: AssetsService, private readonly contract: TotemAsset) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Assets', 'Create')
  async create(request: CreateRequest) {
    const { assetType, ...assetData } = request;
    await this.repository.create(assetType, assetData);
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Assets', 'Update')
  async update(request: UpdateRequest) {
    const { assetType, ...assetData } = request;
    await this.repository.update(assetType, assetData);
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Assets', 'Info')
  async info(request: InfoRequest): Promise<InfoResponse> {
    const { contractAddress, price } = await this.repository.find(request.assetType);
    return { contractAddress, price };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Assets', 'Claim')
  async claim(request: ClaimRequest): Promise<ClaimResponse> {
    const txHash = await this.contract.claim(request.assetType, request.ownerAddress);
    return { txHash };
  }
}
