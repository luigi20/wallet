import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MFAConfirmDTO } from '../dto/mfa_confirmDTO';
import { MFAConfirmService } from '../service/mfa_confirm.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { TokenType } from '@modules/utils/enum';
import { AuthGuardMFA } from '@modules/auth/guards/auth_guard_mfa';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardMFA)
@TokenTypeRequired(TokenType.MFA)
@Controller('auth')
export class MFAConfirmController {
  constructor(private readonly mfaConfirmService: MFAConfirmService) {}

  @Post('mfa/confirm')
  @ApiOperation({
    summary: 'Confirmar configuração do MFA',
    description:
      'Confirma o código MFA informado e habilita ou desabilita o MFA da identidade.',
  })
  @ApiResponse({
    status: 201,
    description: 'MFA confirmado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Código MFA inválido ou dados da requisição inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token MFA inválido, expirado ou ausente.',
  })
  public async MFAConfirm(@Body() data: MFAConfirmDTO) {
    const result = await this.mfaConfirmService.execute({
      email: data.email,
      mfa_code: data.mfa_code,
      enabled_mfa: data.enabled_MFA,
    });
    return result;
  }
}
