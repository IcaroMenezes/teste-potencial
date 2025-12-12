import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferInternalDto } from './dto/transfer-internal.dto';
import { TransferExternalDto } from './dto/transfer-external.dto';
import { BankValidationService } from './services/bank-validation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly bankValidationService: BankValidationService,
  ) {}

  @Post('deposit/:accountId')
  @ApiOperation({ summary: 'Realizar depósito', description: 'Realiza um depósito na conta especificada. O valor deve ser maior que zero. Apenas o dono da conta pode depositar.' })
  @ApiParam({ name: 'accountId', description: 'ID da conta (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: DepositDto })
  @ApiResponse({ status: 201, description: 'Depósito realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor inválido ou conta inativa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é dono da conta)' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async deposit(
    @Param('accountId') accountId: string,
    @Body() depositDto: DepositDto,
    @Request() req,
  ) {
    return this.transactionsService.deposit(
      accountId,
      depositDto,
      req.user.userId,
    );
  }

  @Post('withdraw/:accountId')
  @ApiOperation({ summary: 'Realizar saque', description: 'Realiza um saque da conta especificada. Valida se há saldo suficiente. Apenas o dono da conta pode sacar.' })
  @ApiParam({ name: 'accountId', description: 'ID da conta (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: WithdrawDto })
  @ApiResponse({ status: 201, description: 'Saque realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor inválido, saldo insuficiente ou conta inativa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é dono da conta)' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async withdraw(
    @Param('accountId') accountId: string,
    @Body() withdrawDto: WithdrawDto,
    @Request() req,
  ) {
    return this.transactionsService.withdraw(
      accountId,
      withdrawDto,
      req.user.userId,
    );
  }

  @Post('transfer/internal')
  @ApiOperation({ summary: 'Transferência interna', description: 'Realiza transferência entre contas do próprio banco. Valida saldo suficiente e se ambas as contas estão ativas.' })
  @ApiBody({ type: TransferInternalDto })
  @ApiResponse({ status: 201, description: 'Transferência realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor inválido, saldo insuficiente ou conta inativa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é dono da conta de origem)' })
  @ApiResponse({ status: 404, description: 'Conta de origem ou destino não encontrada' })
  async transferInternal(
    @Body() transferDto: TransferInternalDto,
    @Request() req,
  ) {
    return this.transactionsService.transferInternal(transferDto, req.user.userId);
  }

  @Post('transfer/external')
  @ApiOperation({ summary: 'Transferência externa', description: 'Realiza transferência para conta externa. Valida saldo suficiente, conta destino (Banco, Agência, Conta e CPF) e o banco destino via BrasilAPI.' })
  @ApiBody({ type: TransferExternalDto })
  @ApiResponse({ status: 201, description: 'Transferência externa realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor inválido, saldo insuficiente, conta inativa, banco inválido ou dados da conta destino inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é dono da conta de origem)' })
  @ApiResponse({ status: 404, description: 'Conta de origem não encontrada' })
  async transferExternal(
    @Body() transferDto: TransferExternalDto,
    @Request() req,
  ) {
    return this.transactionsService.transferExternal(transferDto, req.user.userId);
  }

  @Get('banks')
  @ApiOperation({
    summary: 'Listar bancos disponíveis',
    description: 'Retorna a lista completa de bancos disponíveis para transferências externas, obtida da BrasilAPI.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de bancos retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ispb: { type: 'string', example: '00000000' },
          name: { type: 'string', example: 'BANCO DO BRASIL S.A.' },
          code: { type: 'number', example: 1 },
          fullName: { type: 'string', example: 'Banco do Brasil S.A.' },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Erro ao buscar lista de bancos' })
  async listBanks() {
    return this.bankValidationService.listBanks();
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Histórico de transações', description: 'Retorna o histórico completo de transações da conta (depósitos, saques e transferências). Apenas o dono da conta pode visualizar.' })
  @ApiParam({ name: 'accountId', description: 'ID da conta (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Histórico de transações retornado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (não é dono da conta)' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async getTransactionHistory(
    @Param('accountId') accountId: string,
    @Request() req,
  ) {
    return this.transactionsService.getTransactionHistory(
      accountId,
      req.user.userId,
    );
  }
}

