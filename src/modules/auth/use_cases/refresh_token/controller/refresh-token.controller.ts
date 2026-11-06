import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenService } from '../service/refresh-token.service';
import { RefreshTokenDTO } from '../dto/refreshTokenDTO';

@ApiTags('Auth')
@ApiBearerAuth('refresh-token')
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refresh_token_service: RefreshTokenService) {}

  @HttpCode(HttpStatus.OK)
  @Post('refresh_token')
  @ApiOperation({
    summary: 'Atualizar tokens de autenticação',
    description:
      'Valida o refresh token e gera um novo access token e refresh token.',
  })
  @ApiResponse({
    status: 200,
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
    const result = await this.refresh_token_service.execute(data.refresh_token);
    return result;
  }
}
