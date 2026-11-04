import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { SuperUserGuard } from '@modules/auth/guards/super_user_guard';
import { EntityUpdateDTO } from '../dto/entityUpdateDTO';
import { EntityUpdateService } from '../service/entity_update.service';
import { EntityViewModel } from '@modules/auth/entity/shared/view-models/entity-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard, SuperUserGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('entity')
export class EntityUpdateController {
  constructor(private readonly entityUpdateService: EntityUpdateService) {}

  @Put('update/:id')
  @ApiOperation({
    summary: 'Atualizar entidade',
    description: 'Atualiza os dados de uma entidade existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da entidade que será atualizada.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidade atualizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados da entidade inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Usuário não possui permissão de administrador ou não é superusuário.',
  })
  @ApiResponse({
    status: 404,
    description: 'Entidade não encontrada.',
  })
  public async EntityUpdate(
    @Body() data: EntityUpdateDTO,
    @Param('id') id: string,
  ) {
    const result = await this.entityUpdateService.execute({
      status: data.status,
      document: data.document,
      email: data.email,
      phone: data.phone,
      name: data.name,
      photo: data.photo,
      type: data.type,
      id: id,
      city: data.city,
      complement: data.complement,
      country: data.country,
      neighborhood: data.neighborhood,
      number: data.number,
      state: data.state,
      street: data.street,
      zip_code: data.zip_code,
    });

    return EntityViewModel.toHttp(result);
  }
}
