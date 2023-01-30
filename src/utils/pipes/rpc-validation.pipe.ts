import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class RpcValidationPipe extends ValidationPipe {
  constructor(transform: boolean) {
    super({
      transform,
      exceptionFactory: (errors: ValidationError[]) => {
        const response: Record<string, any> = {};
        for (const property in errors) {
          const error = errors[property];
          const messages = [];
          for (const type in error.constraints) {
            messages.push(error.constraints[type]);
          }
          response[property] = messages;
        }
        return new HttpException({ details: response }, HttpStatus.BAD_REQUEST);
      },
    });
  }
}
