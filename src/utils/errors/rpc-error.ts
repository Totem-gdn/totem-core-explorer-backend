import { HttpStatus } from '@nestjs/common';

export interface RpcError {
  status: HttpStatus | number;
  errors: Record<string, string | string[]>;
}
