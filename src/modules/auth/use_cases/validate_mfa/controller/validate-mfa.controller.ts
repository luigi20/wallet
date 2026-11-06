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
import { ValidateMFAService } from '../services/validate-MFA-service';
import { ValidateMFADTO } from '../dto/validate-mfa-DTO';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@Controller('auth')
export class ValidateMFAController {
  constructor(private readonly validate_MFA_service: ValidateMFAService) {}

  @HttpCode(HttpStatus.OK)
  @Post('validate_mfa')
  @ApiOperation({
    summary: 'Validar código MFA',
    description:
      'Valida o código MFA informado e conclui a autenticação do usuário.',
  })
  @ApiResponse({
    status: 200,
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
  public async ValidateMFA(@Body() data: ValidateMFADTO) {
    const result = await this.validate_MFA_service.execute({
      code: data.code,
      mfa_token: data.mfa_token,
    });
    return result;
  }
}
