import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
import { EntityGetOneService } from '../service/entity_get_one.service';
import { EntityViewModel } from '@modules/auth/entity/shared/view-models/entity-view-model';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Entity')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(
  MemberRole.ADMINISTRADOR,
  MemberRole.CLIENTE,
  MemberRole.BARBEIRO,
  MemberRole.RECEPCIONISTA,
)
@Controller('entity')
export class EntityGetOneController {
  constructor(private readonly entityGetOneService: EntityGetOneService) {}

  @Get('get_one/:id')
  @ApiOperation({
    summary: 'Buscar entidade por ID',
    description: 'Retorna os dados de uma entidade específica.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da entidade.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Entidade encontrada com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui uma role permitida.',
  })
  @ApiResponse({
    status: 404,
    description: 'Entidade não encontrada.',
  })
  public async EntityGetOne(@Param('id') id: string) {
    const result = await this.entityGetOneService.execute({
      id,
    });
    return EntityViewModel.toHttp(result);
  }
}
