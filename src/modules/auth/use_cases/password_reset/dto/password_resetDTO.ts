import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class PasswordResetDTO {
  @ApiProperty({
    description: 'E-mail da identidade que terá a senha alterada.',
    example: 'usuario@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nova senha do usuário.',
    example: 'Senha@123456',
  })
  @IsString()
  new_password: string;

  @ApiProperty({
    description: 'Token de desafio utilizado para redefinir a senha.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}
