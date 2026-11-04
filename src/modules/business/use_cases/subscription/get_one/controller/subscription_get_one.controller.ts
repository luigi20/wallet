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
import { SubscriptionViewModel } from '@modules/business/subscription/shared/view-models/subscription-view-model';
import { SubscriptionGetOneService } from '../service/subscription_get_one.service';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess, RolesGuard)
@TokenTypeRequired(TokenType.ACCESS)
@Roles(MemberRole.ADMINISTRADOR)
@Controller('subscription')
export class SubscriptionGetOneController {
  constructor(
    private readonly subscriptionGetOneService: SubscriptionGetOneService,
  ) {}

  @Get('get_one/:id')
  @ApiOperation({
    summary: 'Buscar assinatura',
    description: 'Retorna uma assinatura pelo seu ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da assinatura.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Assinatura encontrada com sucesso.',
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
  public async Subscription(@Param('id') id: string) {
    const result = await this.subscriptionGetOneService.execute(id);
    return SubscriptionViewModel.toHttp(result);
  }
}
