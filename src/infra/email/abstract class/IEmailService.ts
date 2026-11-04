export abstract class IEmailService {
  abstract send(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
