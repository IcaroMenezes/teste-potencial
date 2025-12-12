import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '../entities/account.entity';

export class UpdateAccountStatusDto {
  @ApiProperty({ description: 'Novo status da conta', enum: AccountStatus, example: AccountStatus.ATIVO })
  @IsEnum(AccountStatus)
  status: AccountStatus;
}

