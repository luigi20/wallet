import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDTO {
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

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'João da Silva',
    maxLength: 150,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do usuário.',
    examples: ['123.456.789-00', '00.000.000/E08G-12'],
    maxLength: 18,
  })
  @IsString()
  @Matches(
    /^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2}|[A-Z0-9]{12}\d{2}|[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-\d{2})$/,
    {
      message: 'O documento deve ser um CPF ou CNPJ em formato válido.',
    },
  )
  document: string;
}
