import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';
import { GetTransactionHistoryService } from '../services/get_transaction_history.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class GetTransactionHistoryController {
  constructor(
    private readonly getTransactionHistoryService: GetTransactionHistoryService,
  ) {}

  @Get('transactions')
  @ApiOperation({
    summary: 'Consultar o extrato e histórico de transações da carteira',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de transações obtido com sucesso.',
    schema: {
      example: {
        status: 'success',
        data: [
          {
            id: 'tx-uuid-123',
            amount: 150.0,
            status: 'COMPLETED',
            type: 'DEBIT',
            sender_wallet_id: 'wallet-source-uuid',
            receiver_wallet_id: 'wallet-destination-uuid',
            created_at: '2026-11-06T10:00:00.000Z',
          },
          {
            id: 'tx-uuid-456',
            amount: 50.0,
            status: 'COMPLETED',
            type: 'CREDIT',
            sender_wallet_id: 'wallet-other-uuid',
            receiver_wallet_id: 'wallet-source-uuid',
            created_at: '2026-11-05T15:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT ausente, expirado ou inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Carteira não encontrada para este usuário.',
  })
  async getTransactions(@Req() req) {
    const history = await this.getTransactionHistoryService.execute(
      req.user.id,
    );
    return {
      status: 'success',
      data: history,
    };
  }
}
