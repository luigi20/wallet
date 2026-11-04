import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenDTO } from '../dto/refresh-tokenDTO';
import { RefreshTokenService } from '../service/refresh-token.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { TokenType } from '@modules/utils/enum';
import { AuthGuardRefresh } from '@modules/auth/guards/auth_guard_refresh';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardRefresh)
@TokenTypeRequired(TokenType.REFRESH)
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refresh_token_service: RefreshTokenService) {}

  @Post('refreshtoken')
  @ApiOperation({
    summary: 'Atualizar tokens de autenticação',
    description:
      'Valida o refresh token e gera um novo access token e refresh token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens atualizados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token não informado ou inválido.',
  })
  public async RefreshToken(@Body() data: RefreshTokenDTO) {
    const token = await this.refresh_token_service.execute(data.refresh_token);
    return token;
  }
}
