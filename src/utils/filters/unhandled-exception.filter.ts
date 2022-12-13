import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import { RpcError } from '../errors';

@Catch()
export class UnhandledExceptionFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(UnhandledExceptionFilter.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: any, host: ArgumentsHost): Observable<RpcException> {
    if (exception instanceof RpcException) {
      this.logger.error(`${RpcException.name}: ${JSON.stringify(exception)}`);
      return throwError(() => exception);
    }
    if (exception instanceof HttpException) {
      this.logger.error(`${HttpException.name}: ${JSON.stringify(exception)}`);
      return throwError(
        () =>
          new RpcException(
            JSON.stringify({
              status: exception.getStatus(),
              errors: {
                [exception.name]: exception.getResponse(),
              },
            } as RpcError),
          ),
      );
    }
    if (exception instanceof Error) {
      this.logger.error(`${Error.name}: ${JSON.stringify(exception)}`, exception.stack);
      return throwError(
        () =>
          new RpcException(
            JSON.stringify({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              errors: {
                [exception.name]: exception.message,
              },
            } as RpcError),
          ),
      );
    }
    return throwError(
      () =>
        new RpcException(
          JSON.stringify({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            errors: {
              unknownError: exception,
            },
          } as RpcError),
        ),
    );
  }
}
