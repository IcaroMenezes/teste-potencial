import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Account, AccountStatus } from './entities/account.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createAccount(userId: string): Promise<Account> {
    // Verificar se o usuário já tem uma conta
    const existingAccount = await this.accountRepository.findOne({
      where: { userId },
    });

    if (existingAccount) {
      throw new ConflictException('Usuário já possui uma conta');
    }

    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Criar conta com número único UUID
    const account = this.accountRepository.create({
      numero: uuidv4(),
      saldo: 0,
      status: AccountStatus.ATIVO,
      userId,
    });

    return this.accountRepository.save(account);
  }

  async updateAccountStatus(
    accountId: string,
    status: AccountStatus,
    adminUserId: string,
  ): Promise<Account> {
    // Verificar se o usuário é admin (será validado pelo guard, mas verificamos aqui também)
    const admin = await this.userRepository.findOne({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem alterar o status');
    }

    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    account.status = status;
    return this.accountRepository.save(account);
  }

  async findAccountByUserId(userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }

  async findAccountById(accountId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    return account;
  }
}

