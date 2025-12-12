import { IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferInternalDto {
  @ApiProperty({ description: 'ID da conta de origem (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  origemId: string;

  @ApiProperty({ description: 'ID da conta de destino (UUID)', example: '660e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  destinoId: string;

  @ApiProperty({ description: 'Valor da transferência (deve ser maior que zero)', example: 200.00, minimum: 0.01 })
  @IsNumber()
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  valor: number;
}

