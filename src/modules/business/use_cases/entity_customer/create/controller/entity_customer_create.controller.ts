import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntityCustomerCreateService } from '../services/entity_customer_create.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { EntityCustomerCreateDTO } from '../dto/entity_customer_createDTO';
import { Entity_Customer_View_Model } from '@modules/business/entity_customer/shared/view-models/entity-customer-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity Customer')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR, MemberRole.RECEPCIONISTA)
@Controller('entity_customer')
export class EntityCustomerCreateController {
  constructor(
    private readonly entityCustomerCreateService: EntityCustomerCreateService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Criar cliente',
    description: 'Cria um novo cliente vinculado a uma entidade.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso.',
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
    status: 409,
    description: 'Cliente já cadastrado.',
  })
  public async Members(@Body() data: EntityCustomerCreateDTO) {
    const result = await this.entityCustomerCreateService.execute({
      birth_date: data.birth_date,
      email: data.email,
      entity_id: data.entity_id,
      mfa_required: data.mfa_required,
      name: data.name,
      password: data.password,
      phone: data.phone,
      photo: data.photo,
      notes: data.notes,
    });

    return Entity_Customer_View_Model.toHttp(result);
  }
}
