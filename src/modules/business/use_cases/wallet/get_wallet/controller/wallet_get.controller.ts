import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetWalletService } from '../services/wallet_get.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class GetWalletController {
  constructor(private getWalletService: GetWalletService) {}

  @Get('')
  @ApiOperation({
    summary: 'Consultar saldo e detalhes da carteira do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Carteira consultada com sucesso.',
    schema: {
      example: {
        status: 'success',
        data: {
          wallet_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          balance: 1000.0,
          user_id: 'f9e8d7c6-b5a4-3210-fedc-ba0987654321',
        },
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
  async handle(@Req() req) {
    const wallet = await this.getWalletService.execute(req.user.id);
    return {
      status: 'success',
      data: wallet,
    };
  }
}
