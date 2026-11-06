import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from 'infra/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { extractTokenFromHtml } from '@modules/utils/functions';
import { IEmailService } from 'infra/email/abstract class/IEmailService';
import { randomUUID } from 'crypto';

// secretlint-disable-next-line @secretlint/secretlint-rule-database-connection-string
process.env.DATABASE_URL =
  'postgresql://postgres:4l9u2i7s@localhost:5433/wallet?schema=public';

describe('E2E Complete Suite - Auth & Transactions', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let refreshToken: string;
  let passwordResetToken: string;
  let jwtService: JwtService;
  let senderWalletId: string;
  let receiverWalletId: string;
  let receiver: any;
  let access_token_transaction: string;
  let completedTransactionId: string;
  let wrong_user_id: string;
  // 1. Cria o mock exatamente como fizeste no teste unitário
  const email_service_mock = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IEmailService)
      .useValue(email_service_mock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    await prisma.getPrismaClient().transaction.deleteMany();
    await prisma.getPrismaClient().wallet.deleteMany();
    await prisma.getPrismaClient().passwordResetToken.deleteMany();
    await prisma.getPrismaClient().mfaCode.deleteMany();
    await prisma.getPrismaClient().refreshToken.deleteMany();
    await prisma.getPrismaClient().user.deleteMany();
    const sender = await prisma.getPrismaClient().user.create({
      data: {
        id: randomUUID(),
        name: 'Lucas',
        email: 'lucasopentec@gmail.com',
        password_hash: '4120LLv!@#$',
        document: '02918740530',
        status: 'ativo',
        mfa_required: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    receiver = await prisma.getPrismaClient().user.create({
      data: {
        id: randomUUID(),
        name: 'Pedro',
        email: 'pedroopentec@gmail.com',
        password_hash: '4120LLv!@#$',
        document: '02918740531',
        status: 'ativo',
        mfa_required: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    const sWallet = await prisma.getPrismaClient().wallet.create({
      data: {
        id: randomUUID(),
        user_id: sender.id,
        balance: 1500.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const rWallet = await prisma.getPrismaClient().wallet.create({
      data: {
        id: randomUUID(),
        user_id: receiver.id,
        balance: 200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    const wrong_user = await prisma.getPrismaClient().user.create({
      data: {
        id: randomUUID(),
        name: 'Paulo',
        email: 'pauloopentec@gmail.com',
        password_hash: '4120LLv!@#$',
        document: '02918740533',
        status: 'ativo',
        mfa_required: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    wrong_user_id = wrong_user.id;
    await prisma.getPrismaClient().wallet.create({
      data: {
        id: randomUUID(),
        user_id: wrong_user.id,
        balance: 400.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    senderWalletId = sWallet.id;
    receiverWalletId = rWallet.id;
    access_token_transaction = jwtService.sign(
      {
        sub: sender.id,
        email: sender.email,
        name: sender.name,
        type: 'access',
        iss: 'saas-auth',
        mfa_required: false,
      },
      {
        expiresIn: '15m',
      },
    );
    const transaction = await prisma.getPrismaClient().transaction.create({
      data: {
        id: randomUUID(),
        sender_wallet_id: senderWalletId,
        receiver_wallet_id: receiverWalletId,
        amount: 200.0,
        status: 'COMPLETED',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    completedTransactionId = transaction.id;
  });

  afterAll(async () => {
    await prisma.getPrismaClient().$disconnect();
    await app.close();
  });

  it('/auth/signup (POST) - deve registrar um novo utilizador', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        name: 'Luis',
        email: 'luisopentec@gmail.com',
        password: '4120LLv!@#$',
        document: '02918740535',
      })
      .expect(201);
    expect(response.text).toContain('Usuário cadastrado com sucesso');
  });

  it('/auth/signin (POST) - deve autenticar o utilizador e retornar tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'luisopentec@gmail.com',
        password: '4120LLv!@#$',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refresh_token');
    accessToken = response.body.access_token;
    refreshToken = response.body.refresh_token;
  });

  describe('Password Reset Flow', () => {
    it('/auth/password_reset_request (POST) - deve solicitar recuperação de palavra-passe', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/password_reset_request')
        .send({
          email: 'luisopentec@gmail.com',
        })
        .expect(200);
      expect(response.status).toBeLessThan(300);
      expect(email_service_mock.send).toHaveBeenCalled();
      const calls = email_service_mock.send.mock.calls;
      const lastSentCall = calls[calls.length - 1][0]; // Pega a última chamada feita
      passwordResetToken = extractTokenFromHtml(lastSentCall.html);
      expect(passwordResetToken).toBeDefined();
      expect(passwordResetToken.length).toBeGreaterThan(0);
    });

    it('/auth/password_reset (POST) - deve redefinir a palavra-passe com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/password_reset')
        .send({
          token: passwordResetToken,
          new_password: 'NewStrongPassword123!',
          email: 'luisopentec@gmail.com',
        })
        .expect(200);
      expect(response.status).toBe(200);
    });
  });

  describe('MFA Validation Flow', () => {
    it('/auth/validate_mfa (POST) - deve validar o código MFA com sucesso', async () => {
      const user = await prisma.getPrismaClient().user.findUnique({
        where: { email: 'luisopentec@gmail.com' },
      });
      await prisma.getPrismaClient().user.update({
        where: { id: user.id },
        data: { mfa_required: true },
      });
      const mfaRecord = await prisma.getPrismaClient().mfaCode.create({
        data: {
          attempts: 0,
          id: randomUUID(),
          type: 'login',
          used_at: false,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: user.id,
          code: '123456',
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
      const jwtService = app.get(JwtService);
      const mfaToken = jwtService.sign(
        {
          sub: user.id,
          type: 'mfa',
          mfa_required: true,
          iss: 'saas-auth',
        },
        { expiresIn: '15m' },
      );
      const response = await request(app.getHttpServer())
        .post('/auth/validate_mfa')
        .send({
          code: mfaRecord.code,
          mfa_token: mfaToken,
        })
        .expect(200);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('mfa_required');
      expect(response.body).toHaveProperty('refresh_token');
    });
  });

  describe('Token Refresh & Logout Flow', () => {
    it('/auth/refresh_token (POST) - deve renovar o access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh_token')
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);
      expect(response.body).toHaveProperty('access_token');
      accessToken = response.body.access_token;
    });

    it('/auth/mfa_confirm (POST) - deve confirmar e ativar o MFA com sucesso', async () => {
      const user = await prisma.getPrismaClient().user.findUnique({
        where: { email: 'luisopentec@gmail.com' },
      });
      const mfaRecord = await prisma.getPrismaClient().mfaCode.create({
        data: {
          attempts: 0,
          id: randomUUID(),
          type: 'mfa',
          used_at: false,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: user.id,
          code: '654321',
          expires_at: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/mfa_confirm')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          mfa_code: mfaRecord.code,
          email: user.email,
          enabled_mfa: false,
        })
        .expect(200);
      expect(response.status).toBe(200);
      const updatedUser = await prisma.getPrismaClient().user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser.mfa_required).toBe(false);
    });

    it('/auth/logout (POST) - deve terminar a sessão com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refresh_token: refreshToken,
        })
        .expect(200);
      expect(response.status).toBe(200);
    });
  });
  describe('Transaction Create Flow (E2E)', () => {
    it('/transactions (POST) - deve criar uma transferência com sucesso entre carteiras', async () => {
      const response = await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${access_token_transaction}`)
        .send({
          recipient_wallet_id: receiverWalletId,
          amount: 300.0,
        })
        .expect(201);
      expect(response.text).toContain('Transação realizada com sucesso');
    });

    it('/transactions (POST) - deve retornar erro ao tentar transferir valor superior ao saldo', async () => {
      await request(app.getHttpServer())
        .post('/transactions/create')
        .set('Authorization', `Bearer ${access_token_transaction}`)
        .send({
          recipient_wallet_id: receiverWalletId,
          amount: 99999.0,
        })
        .expect(400);
    });

    it('/transactions/:id/reversal (POST) - deve reverter uma transação com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .post(`/transactions/${completedTransactionId}/reversal`)
        .set('Authorization', `Bearer ${access_token_transaction}`)
        .expect(200);
      expect(response.text).toContain('Transação revertida com sucesso');
      const updatedTransaction = await prisma
        .getPrismaClient()
        .transaction.findUnique({
          where: { id: completedTransactionId },
        });
      expect(updatedTransaction.status).toBe('REVERSED');
    });

    it('/transactions/:id/reversal (POST) - deve retornar erro ao tentar reverter uma transação já revertida', async () => {
      const response = await request(app.getHttpServer())
        .post(`/transactions/${completedTransactionId}/reversal`)
        .set('Authorization', `Bearer ${access_token_transaction}`)
        .expect(400);
      const errorMessage = response.body.message || response.text;
      expect(errorMessage).toContain(
        'Esta transação já foi revertida anteriormente',
      );
    });

    it('/transactions/:id/reversal (POST) - deve retornar 403 se um utilizador não-remetente tentar o estorno', async () => {
      // Cria outra transação
      const anotherTransaction = await prisma
        .getPrismaClient()
        .transaction.create({
          data: {
            id: randomUUID(),
            sender_wallet_id: senderWalletId,
            receiver_wallet_id: receiverWalletId,
            amount: 50.0,
            status: 'COMPLETED',
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      const unauthorizedToken = jwtService.sign(
        {
          sub: wrong_user_id,
          type: 'access',
          mfa_required: true,
          iss: 'saas-auth',
        },
        { expiresIn: '15m' },
      );
      const response = await request(app.getHttpServer())
        .post(`/transactions/${anotherTransaction.id}/reversal`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);
      const errorMessage = response.body.message || response.text;
      expect(errorMessage).toContain(
        'Apenas o remetente original pode solicitar o estorno desta transação',
      );
    });
  });
});
