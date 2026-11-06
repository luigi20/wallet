import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MFAConfirmDTO } from '../dto/mfa_confirmDTO';
import { MFAConfirmService } from '../service/mfa_confirm.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt_auth_guard';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class MFAConfirmController {
  constructor(private readonly mfaConfirmService: MFAConfirmService) {}
  @HttpCode(HttpStatus.OK)
  @Post('mfa_confirm')
  @ApiOperation({
    summary: 'Confirmar configuração do MFA',
    description:
      'Confirma o código MFA informado e habilita ou desabilita o MFA da usuário.',
  })
  @ApiResponse({
    status: 200,
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
      enabled_mfa: data.enabled_mfa,
    });
    return result;
  }
}
