import { IsString, IsNumber, Min, Matches, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferExternalDto {
  @ApiProperty({ description: 'ID da conta de origem (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  origemId: string;

  @ApiProperty({ description: 'Valor da transferência (deve ser maior que zero)', example: 500.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor: number;

  @ApiProperty({ description: 'Código do banco destino (validado via BrasilAPI)', example: '001', examples: ['001 - Banco do Brasil', '033 - Santander', '104 - Caixa', '237 - Bradesco', '341 - Itaú'] })
  @IsString()
  banco: string;

  @ApiProperty({ description: 'Agência da conta destino (obrigatório)', example: '1234', minLength: 1 })
  @IsString()
  agencia: string;

  @ApiProperty({ description: 'Número da conta destino (obrigatório)', example: '567890', minLength: 1 })
  @IsString()
  conta: string;

  @ApiProperty({ description: 'CPF do destinatário no formato XXX.XXX.XXX-XX', example: '987.654.321-00', pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$' })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato XXX.XXX.XXX-XX',
  })
  cpfDestino: string;
}

