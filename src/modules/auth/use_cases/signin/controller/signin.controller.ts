import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDTO } from '../dto/signinDTO';
import { SignInService } from '../service/signin.service';

@ApiTags('Auth')
@Controller('auth')
export class SignInController {
  constructor(private readonly signInService: SignInService) {}

  @Post('signin')
  @ApiOperation({
    summary: 'Realizar login',
    description:
      'Autentica o usuário através do e-mail e senha e retorna o login token e as entidades disponíveis.',
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados da requisição inválidos.',
  })
  public async SignIn(@Body() data: SignInDTO) {
    const result = await this.signInService.execute({
      email: data.email,
      password: data.password,
    });
    return result;
  }
}
