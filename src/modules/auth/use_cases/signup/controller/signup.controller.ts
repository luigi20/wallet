import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignupDTO } from '../dto/signupDTO';
import { SignUpService } from '../service/signup.service';

@ApiTags('Auth')
@Controller('auth')
export class SignUpController {
  constructor(private readonly signupService: SignUpService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Registra um novo usuário no sistema e retorna o token de acesso.',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário registrado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Credenciais inválidas.',
  })
  public async Register(@Body() data: SignupDTO) {
    const result = await this.signupService.execute({
      email: data.email,
      password: data.password,
      name: data.name,
      document: data.document,
    });
    return result;
  }
}
