import { Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Error, MongooseError } from 'mongoose';

@Catch(MongoError, MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError | MongooseError): HttpException {
    if (exception instanceof MongoError) {
      switch (exception.code) {
        case 11000:
          // duplicate exception
          // do whatever you want here, for instance send error to client
          return new HttpException(exception.message, HttpStatus.CONFLICT);
        default:
          return new HttpException(exception.message, HttpStatus.BAD_REQUEST);
      }
    }
    switch ((exception as MongooseError).cause) {
      case 'ValidationError':
        return new HttpException((exception as Error.ValidationError).errors, HttpStatus.BAD_REQUEST);
      case 'ValidatorError':
        return new HttpException(exception.message, HttpStatus.BAD_REQUEST);
      case 'DocumentNotFoundError':
        return new HttpException(exception.message, HttpStatus.NOT_FOUND);
      default:
        return new HttpException(exception.message, HttpStatus.BAD_REQUEST);
    }
  }
}
