import { ArgumentsHost, Catch, HttpException, HttpStatus, RpcExceptionFilter } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { Observable, throwError } from 'rxjs';
import { ValidationError } from 'class-validator';
import { MongoServerError } from 'mongodb';

@Catch()
export class UnhandledExceptionFilter implements RpcExceptionFilter {
  static HttpStatusCode: Record<number, number> = {
    // standard gRPC error mapping
    // https://cloud.google.com/apis/design/errors#handling_errors
    [HttpStatus.BAD_REQUEST]: status.INVALID_ARGUMENT,
    [HttpStatus.UNAUTHORIZED]: status.UNAUTHENTICATED,
    [HttpStatus.PAYMENT_REQUIRED]: status.ABORTED,
    [HttpStatus.FORBIDDEN]: status.PERMISSION_DENIED,
    [HttpStatus.NOT_FOUND]: status.NOT_FOUND,
    [HttpStatus.METHOD_NOT_ALLOWED]: status.CANCELLED,
    [HttpStatus.CONFLICT]: status.ALREADY_EXISTS,
    [HttpStatus.GONE]: status.DATA_LOSS,
    [HttpStatus.PRECONDITION_FAILED]: status.FAILED_PRECONDITION,
    [HttpStatus.TOO_MANY_REQUESTS]: status.RESOURCE_EXHAUSTED,
    [HttpStatus.INTERNAL_SERVER_ERROR]: status.INTERNAL,
    [HttpStatus.NOT_IMPLEMENTED]: status.UNIMPLEMENTED,
    [HttpStatus.BAD_GATEWAY]: status.UNKNOWN,
    [HttpStatus.SERVICE_UNAVAILABLE]: status.UNAVAILABLE,
    [HttpStatus.GATEWAY_TIMEOUT]: status.DEADLINE_EXCEEDED,

    // additional built-in http exceptions
    // https://docs.nestjs.com/exception-filters#built-in-http-exceptions
    499: status.CANCELLED,
    [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: status.UNAVAILABLE,
    [HttpStatus.PAYLOAD_TOO_LARGE]: status.OUT_OF_RANGE,
    [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: status.CANCELLED,
    [HttpStatus.UNPROCESSABLE_ENTITY]: status.CANCELLED,
    [HttpStatus.I_AM_A_TEAPOT]: status.UNKNOWN,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const httpRes = exception.getResponse() as { details?: unknown };

      return throwError(() => ({
        code: UnhandledExceptionFilter.HttpStatusCode[httpStatus] ?? status.UNKNOWN,
        message: exception.message,
        details: httpRes.details,
      }));
    }
    if (exception instanceof ValidationError) {
      return throwError(() => ({
        code: status.INVALID_ARGUMENT,
        message: exception.toString(),
        details: JSON.stringify(exception.constraints),
      }));
    }
    if (exception instanceof MongoServerError) {
      switch (exception.code) {
        case 11000:
          return throwError(() => ({
            code: status.ALREADY_EXISTS,
            message: `duplicate field ${Object.keys(exception.keyValue).toString()}`,
            details: `duplicate field ${Object.keys(exception.keyValue).toString()}`,
          }));
        default:
          return throwError(() => ({
            code: status.INVALID_ARGUMENT,
            message: exception.message,
            details: exception.message,
          }));
      }
    }
    return throwError(() => ({
      code: status.INTERNAL,
      message: JSON.stringify(exception),
    }));
  }
}
