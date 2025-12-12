import { IsEmail, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty({ description: 'Nome completo do usuário', example: 'João Silva', minLength: 3 })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ description: 'Email do usuário (deve ser único)', example: 'joao@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ description: 'CPF no formato XXX.XXX.XXX-XX (deve ser único)', example: '123.456.789-00', pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$' })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato XXX.XXX.XXX-XX',
  })
  cpf: string;

  @ApiPropertyOptional({ description: 'Perfil do usuário', enum: UserRole, example: UserRole.USER, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

