import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntityMembershipUpdateService } from '../services/entity_membership_update.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { EntityMembershipUpdateDTO } from '../dto/entity_membership_updateDTO';
import { Entity_Membership_View_Model } from '@modules/business/entity_membership/shared/view-models/entity-membership-view-model';
import { AuthRequest } from '@modules/utils/types/types';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Membership')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_membership')
export class EntityMembershipUpdateController {
  constructor(
    private readonly entityMembershipUpdateService: EntityMembershipUpdateService,
  ) {}

  @Put('update')
  @ApiOperation({
    summary: 'Atualizar membro',
    description: 'Atualiza os dados de um membro da entidade.',
  })
  @ApiBody({
    type: EntityMembershipUpdateDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Membro atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados do membro inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui permissão para atualizar o membro.',
  })
  @ApiResponse({
    status: 404,
    description: 'Membro não encontrado.',
  })
  public async Members(
    @Body() data: EntityMembershipUpdateDTO,
    @Req() req: AuthRequest,
  ) {
    const result = await this.entityMembershipUpdateService.execute({
      birth_date: data.birth_date,
      email: data.email,
      entity_id: data.entity_id,
      user_id: data.user_id,
      mfa_required: data.mfa_required,
      name: data.name,
      phone: data.phone,
      photo: data.photo,
      roles: data.roles,
      status: data.status,
      roles_auth: req.auth.roles,
    });
    return Entity_Membership_View_Model.toHttp(result);
  }
}
