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
import { SubscriptionViewModel } from '@modules/business/subscription/shared/view-models/subscription-view-model';
import { SubscriptionGetAllService } from '../service/subscription_get_all.service';
import { SuperUserGuard } from '@modules/auth/guards/super_user_guard';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard, SuperUserGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('subscription')
export class SubscriptionGetAllController {
  constructor(
    private readonly subscriptionGetAllService: SubscriptionGetAllService,
  ) {}

  @Get('get_all')
  @ApiOperation({
    summary: 'Listar assinaturas',
    description: 'Retorna todas as assinaturas cadastradas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Assinaturas retornadas com sucesso.',
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
  public async Subscription() {
    const result = await this.subscriptionGetAllService.execute();
    return result.map((item) => SubscriptionViewModel.toHttp(item));
  }
}
