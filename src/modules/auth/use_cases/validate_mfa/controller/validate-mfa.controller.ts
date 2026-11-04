import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ValidateMFAService } from '../services/validate-MFA-service';
import { ValidateMFADTO } from '../dto/validate-mfa-DTO';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { TokenType } from '@modules/utils/enum';
import { AuthGuardMFA } from '@modules/auth/guards/auth_guard_mfa';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardMFA)
@TokenTypeRequired(TokenType.MFA)
@Controller('auth')
export class ValidateMFAController {
  constructor(private readonly validate_MFA_service: ValidateMFAService) {}

  @Post('validatemfa')
  @ApiOperation({
    summary: 'Validar código MFA',
    description:
      'Valida o código MFA informado e conclui a autenticação do usuário.',
  })
  @ApiResponse({
    status: 201,
    description: 'Código MFA validado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Código MFA inválido ou expirado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de desafio ou MFA inválido, expirado ou ausente.',
  })
  public async GenerateMFA(@Body() data: ValidateMFADTO) {
    const result = await this.validate_MFA_service.execute({
      code: data.code,
      mfa_token: data.token,
    });
    return result;
  }
}
