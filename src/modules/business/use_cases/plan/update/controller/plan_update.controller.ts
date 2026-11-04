import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
import { PlanViewModel } from '@modules/business/plan/shared/view-models/plan-view-model';
import { PlanUpdateService } from '../service/plan_update.service';
import { PlanUpdateDTO } from '../dto/planUpdateDTO';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Plan')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard, SuperUserGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('plan')
export class PlanUpdateController {
  constructor(private readonly planUpdateService: PlanUpdateService) {}

  @Put('update/:id')
  @ApiOperation({
    summary: 'Atualizar plano',
    description: 'Atualiza os dados de um plano existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano que será atualizado.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: PlanUpdateDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Plano atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados do plano inválidos.',
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
    description: 'Plano não encontrado.',
  })
  public async PlanUpdate(
    @Body() data: PlanUpdateDTO,
    @Param('id') id: string,
  ) {
    const result = await this.planUpdateService.execute({
      active: data.active,
      max_appointments: data.max_appointments,
      max_customers: data.max_customers,
      max_members: data.max_members,
      name: data.name,
      price: data.price,
      description: data.description ? data.description : null,
      id,
    });
    return PlanViewModel.toHttp(result);
  }
}
