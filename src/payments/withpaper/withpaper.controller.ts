import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { UnhandledExceptionFilter } from '../../utils/filters';
import { RpcValidationPipe } from '../../utils/pipes';
import { WithpaperService } from './withpaper.service';
import { CreatePaymentLinkRequest, CreatePaymentLinkResponse, ProcessWebhookRequest } from './withpaper.interface';

@Controller()
@UseFilters(new UnhandledExceptionFilter())
export class WithpaperController {
  constructor(private readonly service: WithpaperService) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Withpaper', 'CreatePaymentLink')
  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    return await this.service.createPaymentLink(request);
  }

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Withpaper', 'ProcessWebhook')
  async processWebhook(request: ProcessWebhookRequest): Promise<void> {
    return await this.service.processWebhook(request);
  }
}
