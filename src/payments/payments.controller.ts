import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentsService } from '../repository/payments/payments.service';

import { UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import {
  CreateWithpaperPaymentLinkRequest,
  CreateWithpaperPaymentLinkResponse,
  ProcessWithpaperWebhookRequest,
} from './payments.interface';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class PaymentsController {
  constructor(private repository: PaymentsService) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Payments', 'CreateWithpaperPaymentLink')
  async сreateWithpaperPaymentLink(
    request: CreateWithpaperPaymentLinkRequest,
  ): Promise<CreateWithpaperPaymentLinkResponse> {
    return await this.repository.createWithpaperPaymentLink(request);
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Payments', 'ProcessWithpaperWebhook')
  async processWithpaperWebhook(request: ProcessWithpaperWebhookRequest): Promise<void> {
    return await this.repository.processWithpaperWebhook(request);
  }
}
