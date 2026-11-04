import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogoutService } from '../service/logout.service';
import { LogoutDTO } from '../dto/logoutDTO';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(
  MemberRole.ADMINISTRADOR,
  MemberRole.RECEPCIONISTA,
  MemberRole.CLIENTE,
  MemberRole.BARBEIRO,
)
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
    const token = await this.logout_service.execute(data.refresh_token);
    return token;
  }
}
