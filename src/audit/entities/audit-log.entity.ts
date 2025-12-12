import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ length: 255 })
  endpoint: string;

  @Column({ length: 50 })
  method: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @CreateDateColumn()
  createdAt: Date;
}

