import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositCreateDTO {
  @ApiProperty({
    example: 150.0,
    description: 'Valor a ser depositado na carteira (deve ser maior que zero)',
  })
  @IsNumber({}, { message: 'O valor deve ser um número válido' })
  @IsPositive({ message: 'O valor do depósito deve ser maior que zero' })
  amount: number;
}
