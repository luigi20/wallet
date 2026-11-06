import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';

export class TransactionDTO {
  @ApiProperty({
    description: 'ID da carteira do destinatário',
    example: randomUUID(),
  })
  @IsUUID()
  @IsNotEmpty()
  recipient_wallet_id: string;

  @ApiProperty({
    description: 'Valor a ser transferido',
    example: 150.5,
    type: 'number',
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
