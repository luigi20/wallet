import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntityMembershipGetAllService } from '../services/entity_membership_get_all.service';
import { AuthRequest } from '@modules/utils/types/types';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Entity_Membership_View_Model } from '@modules/business/entity_membership/shared/view-models/entity-membership-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Membership')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_membership')
export class EntityMembershipGetAllController {
  constructor(
    private readonly entityMembershipGetAllService: EntityMembershipGetAllService,
  ) {}

  @Get('get_all')
  @ApiOperation({
    summary: 'Listar membros',
    description:
      'Retorna todos os membros vinculados à entidade do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Membros retornados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não possui permissão de administrador ou recepcionista.',
  })
  public async Members(@Req() req: AuthRequest) {
    const result = await this.entityMembershipGetAllService.execute({
      entity_id: req.auth.entity_id,
      is_superuser: req.auth.is_superuser,
    });
    return result.map((item) => Entity_Membership_View_Model.toHttp(item));
  }
}
