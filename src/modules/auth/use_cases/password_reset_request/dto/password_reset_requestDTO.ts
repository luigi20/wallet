import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class PasswordResetRequestDTO {
  @ApiProperty({
    description:
      'E-mail da identidade para a qual será enviada a solicitação de redefinição.',
    example: 'usuario@email.com',
  })
  @IsEmail()
  email: string;
}
