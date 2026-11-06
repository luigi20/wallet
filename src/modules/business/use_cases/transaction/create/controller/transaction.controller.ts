import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionCreateService } from '../services/transaction_create.service';
import { TransactionDTO } from '../dto/transactionDTO';
import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';

@ApiTags('Transaction')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionCreateController {
  constructor(
    private readonly transactionCreateService: TransactionCreateService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Realizar transferência',
    description: 'Realiza uma transferência de valores entre carteiras.',
  })
  @ApiResponse({
    status: 201,
    description: 'Transferência realizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou saldo insuficiente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado.',
  })
  public async Register(@Req() req, @Body() data: TransactionDTO) {
    const result = await this.transactionCreateService.execute({
      sender_id: req.user.id,
      recipient_wallet_id: data.recipient_wallet_id,
      amount: data.amount,
    });
    return result;
  }
}
