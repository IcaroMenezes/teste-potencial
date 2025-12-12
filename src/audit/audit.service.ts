import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: string | null,
    endpoint: string,
    method: string,
    payload: any,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      userId,
      endpoint,
      method,
      payload: JSON.stringify(payload),
    });

    await this.auditLogRepository.save(auditLog);
  }
}

