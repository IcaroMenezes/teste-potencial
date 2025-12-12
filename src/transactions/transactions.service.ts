import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Account, AccountStatus } from '../accounts/entities/account.entity';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferInternalDto } from './dto/transfer-internal.dto';
import { TransferExternalDto } from './dto/transfer-external.dto';
import { BankValidationService } from './services/bank-validation.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private bankValidationService: BankValidationService,
    private dataSource: DataSource,
  ) {}

  async deposit(
    accountId: string,
    depositDto: DepositDto,
    userId: string,
  ): Promise<Transaction> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('Você só pode depositar na sua própria conta');
    }

    if (account.status !== AccountStatus.ATIVO) {
      throw new BadRequestException('Conta não está ativa');
    }

    if (depositDto.valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      account.saldo = Number(account.saldo) + Number(depositDto.valor);
      await queryRunner.manager.save(account);

      const transaction = queryRunner.manager.create(Transaction, {
        tipo: TransactionType.DEPOSIT,
        valor: depositDto.valor,
        origemId: accountId,
        saldoPos: account.saldo,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(
    accountId: string,
    withdrawDto: WithdrawDto,
    userId: string,
  ): Promise<Transaction> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('Você só pode sacar da sua própria conta');
    }

    if (account.status !== AccountStatus.ATIVO) {
      throw new BadRequestException('Conta não está ativa');
    }

    if (withdrawDto.valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const saldoAtual = Number(account.saldo);
    if (saldoAtual < withdrawDto.valor) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      account.saldo = saldoAtual - Number(withdrawDto.valor);
      await queryRunner.manager.save(account);

      const transaction = queryRunner.manager.create(Transaction, {
        tipo: TransactionType.WITHDRAW,
        valor: withdrawDto.valor,
        origemId: accountId,
        saldoPos: account.saldo,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transferInternal(
    transferDto: TransferInternalDto,
    userId: string,
  ): Promise<Transaction> {
    if (transferDto.valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const origem = await this.accountRepository.findOne({
      where: { id: transferDto.origemId },
    });

    if (!origem) {
      throw new NotFoundException('Conta de origem não encontrada');
    }

    if (origem.userId !== userId) {
      throw new ForbiddenException('Você só pode transferir da sua própria conta');
    }

    if (origem.status !== AccountStatus.ATIVO) {
      throw new BadRequestException('Conta de origem não está ativa');
    }

    const destino = await this.accountRepository.findOne({
      where: { id: transferDto.destinoId },
    });

    if (!destino) {
      throw new NotFoundException('Conta de destino não encontrada');
    }

    if (destino.status !== AccountStatus.ATIVO) {
      throw new BadRequestException('Conta de destino não está ativa');
    }

    const saldoAtual = Number(origem.saldo);
    if (saldoAtual < transferDto.valor) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      origem.saldo = saldoAtual - Number(transferDto.valor);
      destino.saldo = Number(destino.saldo) + Number(transferDto.valor);

      await queryRunner.manager.save(origem);
      await queryRunner.manager.save(destino);

      const transaction = queryRunner.manager.create(Transaction, {
        tipo: TransactionType.TRANSFER_INTERNAL,
        valor: transferDto.valor,
        origemId: transferDto.origemId,
        destinoId: transferDto.destinoId,
        saldoPos: origem.saldo,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transferExternal(
    transferDto: TransferExternalDto,
    userId: string,
  ): Promise<Transaction> {
    if (transferDto.valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const origem = await this.accountRepository.findOne({
      where: { id: transferDto.origemId },
    });

    if (!origem) {
      throw new NotFoundException('Conta de origem não encontrada');
    }

    if (origem.userId !== userId) {
      throw new ForbiddenException('Você só pode transferir da sua própria conta');
    }

    if (origem.status !== AccountStatus.ATIVO) {
      throw new BadRequestException('Conta de origem não está ativa');
    }

    // Validação de saldo
    const saldoAtual = Number(origem.saldo);
    if (saldoAtual < transferDto.valor) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}, Valor solicitado: R$ ${transferDto.valor.toFixed(2)}`,
      );
    }

    // Validação da conta destino (formato)
    if (!transferDto.agencia || transferDto.agencia.trim().length === 0) {
      throw new BadRequestException('Agência da conta destino é obrigatória');
    }

    if (!transferDto.conta || transferDto.conta.trim().length === 0) {
      throw new BadRequestException('Número da conta destino é obrigatório');
    }

    if (!transferDto.cpfDestino || transferDto.cpfDestino.trim().length === 0) {
      throw new BadRequestException('CPF do destinatário é obrigatório');
    }

    // Validar banco via BrasilAPI
    const bankInfo = await this.bankValidationService.validateBank(
      transferDto.banco,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      origem.saldo = saldoAtual - Number(transferDto.valor);
      await queryRunner.manager.save(origem);

      const transaction = queryRunner.manager.create(Transaction, {
        tipo: TransactionType.TRANSFER_EXTERNAL,
        valor: transferDto.valor,
        origemId: transferDto.origemId,
        bancoDestino: `${transferDto.banco} - ${bankInfo.name}`,
        agenciaDestino: transferDto.agencia.trim(),
        contaDestino: transferDto.conta.trim(),
        cpfDestino: transferDto.cpfDestino.trim(),
        saldoPos: origem.saldo,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionHistory(
    accountId: string,
    userId: string,
  ): Promise<Transaction[]> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    if (account.userId !== userId) {
      throw new ForbiddenException('Você só pode ver o histórico da sua própria conta');
    }

    return this.transactionRepository.find({
      where: [
        { origemId: accountId },
        { destinoId: accountId },
      ],
      order: { timestamp: 'DESC' },
      relations: ['origem', 'destino'],
    });
  }
}

