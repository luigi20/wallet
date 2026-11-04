import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class MFARequestDTO {
  @ApiProperty({
    description: 'E-mail da identidade que receberá o novo código MFA.',
    example: 'usuario@email.com',
  })
  @IsEmail()
  email: string;
}
