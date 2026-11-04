import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntityCustomerUpdateService } from '../services/entity_customer_update.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { EntityCustomerUpdateDTO } from '../dto/entity_customer_updateDTO';
import { Entity_Customer_View_Model } from '@modules/business/entity_customer/shared/view-models/entity-customer-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Customer')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_customer')
export class EntityCustomerUpdateController {
  constructor(
    private readonly entityCustomerUpdateService: EntityCustomerUpdateService,
  ) {}

  @Put('update')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza os dados de um cliente existente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados do cliente inválidos.',
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
  @ApiBody({
    type: EntityCustomerUpdateDTO,
  })
  public async Members(@Body() data: EntityCustomerUpdateDTO) {
    const result = await this.entityCustomerUpdateService.execute({
      birth_date: data.birth_date,
      email: data.email,
      entity_id: data.entity_id,
      mfa_required: data.mfa_required,
      name: data.name,
      phone: data.phone,
      photo: data.photo,
      notes: data.notes,
      status: data.status,
    });

    return Entity_Customer_View_Model.toHttp(result);
  }
}
