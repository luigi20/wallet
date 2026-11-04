import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlanCreateService } from '../service/plan_create.service';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { SuperUserGuard } from '@modules/auth/guards/super_user_guard';
import { PlanViewModel } from '@modules/business/plan/shared/view-models/plan-view-model';
import { PlanCreateDTO } from '../dto/planCreateDTO';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Plan')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard, SuperUserGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('plan')
export class PlanCreateController {
  constructor(private readonly planService: PlanCreateService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Criar plano',
    description: 'Cria um novo plano para a plataforma.',
  })
  @ApiBody({
    type: PlanCreateDTO,
  })
  @ApiResponse({
    status: 201,
    description: 'Plano criado com sucesso.',
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
    description: 'Usuário não possui permissão para criar planos.',
  })
  @ApiResponse({
    status: 409,
    description: 'Plano já cadastrado.',
  })
  public async SignIn(@Body() data: PlanCreateDTO) {
    const result = await this.planService.execute({
      active: data.active,
      max_appointments: data.max_appointments,
      max_customers: data.max_customers,
      max_members: data.max_members,
      name: data.name,
      price: data.price,
      description: data.description ? data.description : null,
    });
    return PlanViewModel.toHttp(result);
  }
}
