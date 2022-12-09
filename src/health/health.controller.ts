import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HealthCheckRequest, HealthCheckResponse, ServingStatus } from './health.interface';

@Controller()
export class HealthController {
  @GrpcMethod('Health', 'Check')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  check(_data: HealthCheckRequest, _metadata: any): HealthCheckResponse {
    return { status: ServingStatus.SERVING };
  }
}
