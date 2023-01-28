import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Long } from '@grpc/proto-loader';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  ClaimPaymentKeyRequest,
  ClaimPaymentKeyResponse,
  CreatePaymentKeysRequest,
  PaymentKeysStatusRequest,
  PaymentKeysStatusResponse,
} from './payment-keys.interface';
import { PaymentKeysService } from '../repository/payment-keys';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class PaymentKeysController {
  constructor(private repository: PaymentKeysService) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('PaymentKeys', 'Create')
  async createPaymentKeys(request: CreatePaymentKeysRequest): Promise<void> {
    await this.repository.createPaymentKeys({
      apiKey: request.apiKey,
      assetType: request.assetType,
      amount: request.amount.toNumber(),
    });
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('PaymentKeys', 'Claim')
  async claimPaymentKey(request: ClaimPaymentKeyRequest): Promise<ClaimPaymentKeyResponse> {
    const txHash = await this.repository.claimPaymentKey({
      apiKey: request.apiKey,
      player: request.playerAddress,
      assetType: request.assetType,
    });
    return { txHash };
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('PaymentKeys', 'Status')
  async paymentKeysStatus(request: PaymentKeysStatusRequest): Promise<PaymentKeysStatusResponse> {
    const amount = await this.repository.paymentKeysStatus({
      apiKey: request.apiKey,
      assetType: request.assetType,
      status: request.status,
    });
    return { amount: Long.fromNumber(amount) };
  }
}
