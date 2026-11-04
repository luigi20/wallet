import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntityCustomerGetAllService } from '../services/entity_customer_get_all.service';
import { AuthRequest } from '@modules/utils/types/types';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { Entity_Customer_View_Model } from '@modules/business/entity_customer/shared/view-models/entity-customer-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Customer')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_customer')
export class EntityCustomerGetAllController {
  constructor(
    private readonly entityCustomerGetAllService: EntityCustomerGetAllService,
  ) {}

  @Get('get_all')
  @ApiOperation({
    summary: 'Listar clientes',
    description:
      'Retorna todos os clientes vinculados à entidade do usuário autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Clientes retornados com sucesso.',
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
    const result = await this.entityCustomerGetAllService.execute({
      entity_id: req.auth.entity_id,
      is_superuser: req.auth.is_superuser,
    });

    return result.map((item) => Entity_Customer_View_Model.toHttp(item));
  }
}
