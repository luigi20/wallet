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
import { EntityCustomerGetOneService } from '../services/entity_customer_get_one.service';
import { Entity_Customer_View_Model } from '@modules/business/entity_customer/shared/view-models/entity-customer-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Customer')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_customer')
export class EntityCustomerGetOneController {
  constructor(
    private readonly entityCustomerGetOneService: EntityCustomerGetOneService,
  ) {}

  @Get('get_one')
  @ApiOperation({
    summary: 'Buscar cliente',
    description: 'Retorna um cliente específico pelo entity_id e profile_id.',
  })
  @ApiQuery({
    name: 'entity_id',
    required: true,
    description: 'ID da entidade onde o cliente está cadastrado.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'profile_id',
    required: true,
    description: 'ID do perfil do cliente.',
    example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado com sucesso.',
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
    description: 'Cliente não encontrado.',
  })
  public async Members(
    @Req() req: AuthRequest,
    @Query('entity_id') entity_id: string,
    @Query('profile_id') profile_id: string,
  ) {
    const result = await this.entityCustomerGetOneService.execute({
      entity_id_user: req.auth.entity_id,
      is_superuser: req.auth.is_superuser,
      entity_id,
      profile_id,
    });
    return Entity_Customer_View_Model.toHttp(result);
  }
}
