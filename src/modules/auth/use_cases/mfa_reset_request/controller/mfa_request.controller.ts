import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MFARequestDTO } from '../dto/mfa_requestDTO';
import { MFARequestService } from '../service/mfa_request.service';
import { TokenTypeRequired } from '@modules/auth/decorators/token-type.decorator';
import { TokenType } from '@modules/utils/enum';
import { AuthGuardAccess } from '@modules/auth/guards/auth_guard_access';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuardAccess)
@TokenTypeRequired(TokenType.ACCESS)
@Controller('auth')
export class MFARequestController {
  constructor(private readonly mfaRequestService: MFARequestService) {}

  @Post('mfarequest')
  @ApiOperation({
    summary: 'Solicitar novo código MFA',
    description: 'Gera e envia um novo código MFA para o e-mail informado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Código MFA solicitado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados da requisição inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token MFA ou LOGIN inválido, expirado ou ausente.',
  })
  public async MFARequest(@Body() data: MFARequestDTO) {
    const result = await this.mfaRequestService.execute({
      email: data.email,
    });
    return result;
  }
}
