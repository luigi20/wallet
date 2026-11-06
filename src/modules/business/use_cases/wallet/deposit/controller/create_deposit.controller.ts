import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DepositCreateDTO } from '../dto/depositCreateDTO';
import { CreateDepositService } from '../services/create_deposit.services';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class CreateDepositController {
  constructor(private readonly createDepositService: CreateDepositService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Realizar um depósito de fundos na carteira' })
  @ApiBody({ type: DepositCreateDTO })
  @ApiResponse({
    status: 201,
    description: 'Depósito efetuado com sucesso.',
    schema: {
      example: {
        status: 'success',
        message: 'Depósito realizado com sucesso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (ex: valor menor ou igual a zero).',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT ausente ou inválido.',
  })
  @ApiResponse({
    status: 404,
    description: 'Carteira não encontrada.',
  })
  async deposit(@Req() req, @Body() dto: DepositCreateDTO) {
    const result = await this.createDepositService.execute({
      user_id: req.user.id,
      amount: dto.amount,
    });
    return result;
  }
}
