import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '@modules/auth/guards/roles_guards';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { MemberRole, TokenType } from '@modules/utils/enum';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import { SubscriptionCreateDTO } from '../dto/subscriptionCreateDTO';
import { SubscriptionViewModel } from '@modules/business/subscription/shared/view-models/subscription-view-model';
import { SubscriptionCreateService } from '../service/subscription_create.service';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('subscription')
export class SubscriptionCreateController {
  constructor(
    private readonly subscriptionCreateService: SubscriptionCreateService,
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'Criar assinatura',
    description: 'Cria uma nova assinatura para uma entidade.',
  })
  @ApiBody({
    type: SubscriptionCreateDTO,
  })
  @ApiResponse({
    status: 201,
    description: 'Assinatura criada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados da assinatura inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de acesso inválido, expirado ou ausente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não possui a role de administrador.',
  })
  public async Subscription(@Body() data: SubscriptionCreateDTO) {
    const result = await this.subscriptionCreateService.execute({
      entity_id: data.entity_id,
      plan_id: data.plan_id,
    });
    return SubscriptionViewModel.toHttp(result);
  }
}
