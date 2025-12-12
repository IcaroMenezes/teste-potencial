import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  TRANSFER_INTERNAL = 'TRANSFER_INTERNAL',
  TRANSFER_EXTERNAL = 'TRANSFER_EXTERNAL',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  tipo: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'origemId' })
  origem: Account;

  @Column({ nullable: true })
  origemId: string;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'destinoId' })
  destino: Account;

  @Column({ nullable: true })
  destinoId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  saldoPos: number;

  @Column({ nullable: true, length: 255 })
  bancoDestino: string;

  @Column({ nullable: true, length: 20 })
  agenciaDestino: string;

  @Column({ nullable: true, length: 50 })
  contaDestino: string;

  @Column({ nullable: true, length: 14 })
  cpfDestino: string;

  @CreateDateColumn()
  timestamp: Date;
}

