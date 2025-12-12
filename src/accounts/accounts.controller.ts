import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { UpdateAccountStatusDto } from './dto/update-account-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar conta digital', description: 'Cria uma conta digital para o usuário autenticado. Cada usuário pode ter apenas uma conta. A conta é criada com saldo zero e status ATIVO.' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 409, description: 'Usuário já possui uma conta' })
  async createAccount(@Request() req) {
    return this.accountsService.createAccount(req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Alterar status da conta', description: 'Altera o status de uma conta (ATIVO/INATIVO). Apenas administradores podem executar esta ação.' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiBody({ type: UpdateAccountStatusDto })
  @ApiResponse({ status: 200, description: 'Status da conta alterado com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Acesso negado (apenas ADMIN)' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async updateAccountStatus(
    @Param('id') accountId: string,
    @Body() updateAccountStatusDto: UpdateAccountStatusDto,
    @Request() req,
  ) {
    return this.accountsService.updateAccountStatus(
      accountId,
      updateAccountStatusDto.status,
      req.user.userId,
    );
  }
}

