import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionReversalService } from '../services/transaction_reversal.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';

@ApiTags('Transaction')
@Controller('transactions')
export class TransactionReversalController {
  constructor(
    private readonly transactionReversalService: TransactionReversalService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post(':id/reversal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Solicitar estorno de uma transação',
    description:
      'Permite que o remetente solicite a reversão de uma transferência concluída.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação revertida com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Transação já revertida ou saldo insuficiente no destino.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não autorizado a estornar esta transação.',
  })
  @ApiResponse({
    status: 404,
    description: 'Transação ou carteiras não encontradas.',
  })
  public async reverse(@Req() req, @Param('id') id: string) {
    const result = await this.transactionReversalService.execute({
      transaction_id: id,
      user_id: req.user.id,
    });
    return result;
  }
}
