import { AppError } from '@modules/utils/app_error';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: AppError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.statusCode || HttpStatus.BAD_REQUEST;
    response.status(status).json({
      status: 'error',
      statusCode: status,
      message: exception.message,
      ...(exception.id && { id: exception.id }),
      ...(exception.traceSteps && { trace_steps: exception.traceSteps }),
    });
  }
}
