import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../utils/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query } = request;
    const now = Date.now();

    this.loggerService.log(
      `Incoming Request: ${method} ${url} - Query: ${JSON.stringify(query)} - Body: ${JSON.stringify(body)}`,
      'http-interceptor'
    );

    return next
      .handle()
      .pipe(
        tap(() =>
          this.loggerService.log(
            `Outgoing Response: ${method} ${url} - ${Date.now() - now}ms`,
            'http-interceptor'
          ),
        ),
      );
  }
}
