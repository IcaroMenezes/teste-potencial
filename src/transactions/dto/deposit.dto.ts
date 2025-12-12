import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ description: 'Valor do depósito (deve ser maior que zero)', example: 1000.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor: number;
}

