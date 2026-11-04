import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { EntityViewModel } from '@modules/auth/entity/shared/view-models/entity-view-model';
import { EntityGetAllService } from '../service/entity_get_all.service';
import { SuperUserGuard } from '@modules/auth/guards/super_user_guard';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard, SuperUserGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('entity')
export class EntityGetAllController {
  constructor(private readonly entityGetAllService: EntityGetAllService) {}

  @Get('get_all')
  @ApiOperation({
    summary: 'Listar entidades',
    description: 'Retorna todas as entidades disponíveis para o administrador.',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidades retornadas com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não possui a role de administrador ou não é superusuário.',
  })
  public async EntityGetAll() {
    const result = await this.entityGetAllService.execute();
    return result.map((item) => EntityViewModel.toHttp(item));
  }
}
