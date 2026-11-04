import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Profile_View_Model } from '@modules/auth/profile/shared/view-models/profile-view-model';
import { AuthRequest } from '@modules/utils/types/types';
import { MeProfileService } from '../service/me_profile.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(
  MemberRole.ADMINISTRADOR,
  MemberRole.RECEPCIONISTA,
  MemberRole.CLIENTE,
  MemberRole.BARBEIRO,
)
@Controller()
export class MeProfileController {
  constructor(private readonly me_profile_service: MeProfileService) {}

  @Get('me_profile')
  @ApiOperation({
    summary: 'Obter meu perfil',
    description:
      'Retorna os dados do perfil do usuário autenticado dentro da entidade selecionada.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui uma role permitida.',
  })
  public async MeProfile(@Req() req: AuthRequest) {
    const result = await this.me_profile_service.execute({
      profile_id: req.auth.profile_id,
      entity_id: req.auth.entity_id,
    });
    return Profile_View_Model.toHttp(result);
  }
}
