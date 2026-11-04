import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateMFADTO {
  @ApiProperty({
    description: 'Código MFA recebido por e-mail.',
    example: 123456,
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Token MFA utilizado para validar o código.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;
}
