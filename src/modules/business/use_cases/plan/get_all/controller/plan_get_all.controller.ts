import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { PlanViewModel } from '@modules/business/plan/shared/view-models/plan-view-model';
import { PlanGetAllService } from '../service/plan_get_all.service';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Plan')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('plan')
export class PlanGetAllController {
  constructor(private readonly planGetAllService: PlanGetAllService) {}

  @Get('get_all')
  @ApiOperation({
    summary: 'Listar planos',
    description: 'Retorna todos os planos cadastrados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Planos retornados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui a role de administrador.',
  })
  public async PlanGetAll() {
    const result = await this.planGetAllService.execute();
    return result.map((item) => PlanViewModel.toHttp(item));
  }
}
