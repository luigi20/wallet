import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailService } from '../abstract class/IEmailService';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: to,
      subject: subject,
      html: html,
    });
    if (error) throw new Error(`Erro ao enviar e-mail: ${error.message}`);
  }
}
