import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthRequest } from '@modules/utils/types/types';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { EntityMembershipGetOneService } from '../services/entity_membership_get_one.service';
import { Entity_Membership_View_Model } from '@modules/business/entity_membership/shared/view-models/entity-membership-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Membership')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_membership')
export class EntityMembershipGetOneController {
  constructor(
    private readonly entityMembershipGetOneService: EntityMembershipGetOneService,
  ) {}

  @Get('get_one')
  @ApiOperation({
    summary: 'Buscar membro',
    description:
      'Busca um membro específico através do entity_id e profile_id.',
  })
  @ApiQuery({
    name: 'entity_id',
    required: true,
    description: 'ID da entidade.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'profile_id',
    required: true,
    description: 'ID do perfil do membro.',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  })
  @ApiResponse({
    status: 200,
    description: 'Membro encontrado com sucesso.',
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
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado.',
  })
  public async Members(
    @Req() req: AuthRequest,
    @Query('entity_id') entity_id: string,
    @Query('profile_id') profile_id: string,
  ) {
    const result = await this.entityMembershipGetOneService.execute({
      entity_id_user: req.auth.entity_id,
      is_superuser: req.auth.is_superuser,
      entity_id,
      profile_id,
    });
    return Entity_Membership_View_Model.toHttp(result);
  }
}
