import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInDTO {
  @ApiProperty({
    description: 'E-mail utilizado para o cadastro.',
    example: 'usuario@email.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    description: 'Senha de acesso do usuário.',
    example: 'Senha@123456',
    minLength: 10,
    maxLength: 100,
    writeOnly: true,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\S).*$/, {
    message: 'A senha deve conter letras maiúsculas, minúsculas e números.',
  })
  password: string;
}
