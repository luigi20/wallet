import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordResetRequestDTO } from '../dto/password_reset_requestDTO';
import { PasswordResetRequestService } from '../service/password_reset_request.service';

@ApiTags('Auth')
@Controller('auth')
export class PasswordResetRequestController {
  constructor(
    private readonly passwordResetRequestService: PasswordResetRequestService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('password_reset_request')
  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description:
      'Envia uma solicitação de redefinição de senha para o e-mail informado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitação de redefinição enviada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'E-mail informado é inválido.',
  })
  public async PasswordResetRequest(@Body() data: PasswordResetRequestDTO) {
    const result = await this.passwordResetRequestService.execute({
      email: data.email,
    });
    return result;
  }
}
