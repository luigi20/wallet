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
import { PlanViewModel } from '@modules/business/plan/shared/view-models/plan-view-model';
import { PlanGetOneService } from '../service/plan_get_one.service';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Plan')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('plan')
export class PlanGetOneController {
  constructor(private readonly planGetOneService: PlanGetOneService) {}

  @Get('get_one/:id')
  @ApiOperation({
    summary: 'Buscar plano',
    description: 'Retorna um plano pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano encontrado com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui a role de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano não encontrado.',
  })
  public async PlanGetAll(@Param('id') id: string) {
    const result = await this.planGetOneService.execute(id);
    return PlanViewModel.toHttp(result);
  }
}
