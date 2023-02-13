import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import { AssetsService } from './assets.service';
import { ClaimAssetRequest, ClaimAssetResponse } from './assets.interface';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class AssetsController {
  constructor(private service: AssetsService) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Assets', 'ClaimAsset')
  async createPaymentKeys(request: ClaimAssetRequest): Promise<ClaimAssetResponse> {
    return await this.service.claimAsset({
      ownerAddress: request.ownerAddress,
      assetType: request.assetType,
    });
  }
}
