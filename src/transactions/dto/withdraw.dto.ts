import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ description: 'Valor do saque (deve ser maior que zero e não exceder o saldo)', example: 500.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor: number;
}

