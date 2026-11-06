import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogoutService } from '../service/logout.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';
import { Request, Response } from 'express';
import { LogoutDTO } from '../dto/logoutDTO';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class LogoutController {
  constructor(private readonly logout_service: LogoutService) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Encerrar sessão',
    description:
      'Invalida o refresh token e encerra a sessão do usuário autenticado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessão encerrada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Refresh token inválido.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não possui permissão para realizar esta operação.',
  })
  public async Logout(@Body() data: LogoutDTO) {
    await this.logout_service.execute(data.refresh_token);
  }
}
