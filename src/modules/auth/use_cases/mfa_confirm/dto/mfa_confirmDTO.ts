import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class MFAConfirmDTO {
  @ApiProperty({
    description: 'E-mail da identidade.',
    example: 'usuario@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Código MFA recebido por e-mail.',
    example: 123456,
  })
  @IsString()
  mfa_code: string;

  @ApiProperty({
    description: 'Define se o MFA será habilitado ou desabilitado.',
    example: true,
  })
  @IsBoolean()
  enabled_MFA: boolean;
}
