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
import { SubscriptionUpdateDTO } from '../dto/subscriptionUpdateDTO';
import { SubscriptionViewModel } from '@modules/business/subscription/shared/view-models/subscription-view-model';
import { SubscriptionUpdateService } from '../service/subscription_update.service';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('subscription')
export class SubscriptionUpdateController {
  constructor(
    private readonly subscriptionUpdateService: SubscriptionUpdateService,
  ) {}

  @Put('update/:id')
  @ApiOperation({
    summary: 'Atualizar assinatura',
    description: 'Atualiza os dados de uma assinatura existente.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da assinatura.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: SubscriptionUpdateDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Assinatura atualizada com sucesso.',
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
  @ApiResponse({
    status: 404,
    description: 'Assinatura não encontrada.',
  })
  public async Subscription(
    @Body() data: SubscriptionUpdateDTO,
    @Param('id') id: string,
  ) {
    const result = await this.subscriptionUpdateService.execute({
      entity_id: data.entity_id,
      plan_id: data.plan_id,
      status: data.status,
      id,
    });
    return SubscriptionViewModel.toHttp(result);
  }
}
