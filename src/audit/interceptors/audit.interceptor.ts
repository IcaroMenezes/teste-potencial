import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url, method, body, user } = request;

    const userId = user?.userId || null;

    return next.handle().pipe(
      tap(() => {
        // Log assíncrono sem bloquear a resposta
        this.auditService.log(userId, url, method, body).catch((err) => {
          console.error('Erro ao registrar auditoria:', err);
        });
      }),
    );
  }
}

