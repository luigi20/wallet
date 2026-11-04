import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class GenerateMFADTO {
  @ApiProperty({
    description: 'E-mail da identidade que receberá o código MFA.',
    example: 'usuario@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Tipo da operação que está solicitando o MFA.',
    example: 'login',
  })
  @IsString()
  type: string;
}
