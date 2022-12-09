import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';

import { RpcError } from '../errors';

export class RpcValidationPipe extends ValidationPipe {
  constructor(transform: boolean) {
    super({
      transform,
      exceptionFactory: (errors: ValidationError[]) => {
        const rpcErrors: RpcError = {
          status: HttpStatus.BAD_REQUEST,
          errors: {},
        };
        for (const propertyKey in errors) {
          const error = errors[propertyKey];
          const messages = [];
          for (const errorKey in error.constraints) {
            messages.push(error.constraints[errorKey]);
          }
          rpcErrors.errors[error.property] = messages;
        }
        return new RpcException(JSON.stringify(rpcErrors));
      },
    });
  }
}
