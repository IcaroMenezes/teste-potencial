import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

export interface Bank {
  ispb: string;
  name: string;
  code: number;
  fullName: string;
}

@Injectable()
export class BankValidationService {
  private readonly brasilApiBaseUrl = 'https://brasilapi.com.br/api/banks/v1';

  /**
   * Valida se um código de banco existe na BrasilAPI
   */
  async validateBank(bankCode: string): Promise<Bank> {
    try {
      const response = await axios.get<Bank>(
        `${this.brasilApiBaseUrl}/${bankCode}`,
        {
          timeout: 5000,
        },
      );

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new BadRequestException('Banco inválido ou não encontrado');
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException(
          `Banco com código ${bankCode} não encontrado. Verifique o código e tente novamente.`,
        );
      }

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BadRequestException(
          'Erro ao validar banco: timeout na comunicação com BrasilAPI',
        );
      }

      throw new BadRequestException(
        'Erro ao validar banco. Verifique o código e tente novamente.',
      );
    }
  }

  /**
   * Lista todos os bancos disponíveis na BrasilAPI
   */
  async listBanks(): Promise<Bank[]> {
    try {
      const response = await axios.get<Bank[]>(this.brasilApiBaseUrl, {
        timeout: 10000,
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data;
      }

      throw new BadRequestException('Erro ao listar bancos');
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new BadRequestException(
          'Erro ao listar bancos: timeout na comunicação com BrasilAPI',
        );
      }

      throw new BadRequestException(
        'Erro ao buscar lista de bancos. Tente novamente mais tarde.',
      );
    }
  }

  /**
   * Busca informações de um banco específico
   */
  async getBankByCode(bankCode: string): Promise<Bank> {
    return this.validateBank(bankCode);
  }
}

