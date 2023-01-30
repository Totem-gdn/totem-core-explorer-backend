import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { MongoExceptionFilter, UnhandledExceptionFilter } from '../utils/filters';
import { RpcValidationPipe } from '../utils/pipes';
import { PublishersService } from '../repository/publishers';
import { CreatePublisherRequest, CreatePublisherResponse } from './publishers.interface';

@Controller()
@UseFilters(MongoExceptionFilter, UnhandledExceptionFilter)
export class PublishersController {
  constructor(private repository: PublishersService) {}

  @UsePipes(new RpcValidationPipe(true))
  @GrpcMethod('Publishers', 'Create')
  async createPublisher(request: CreatePublisherRequest): Promise<CreatePublisherResponse> {
    const apiKey = await this.repository.createPublisher(request);
    return { apiKey };
  }
}
