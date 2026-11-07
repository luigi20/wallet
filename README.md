# 💳 Transaction Wallet API

> API robusta em NestJS 11 e Prisma ORM para gestão de carteiras digitais, transações financeiras, depósitos, consulta de saldo, extratos, fluxos avançados de autenticação (MFA e redefinição de palavra-passe) e estornos, focada em observabilidade, resiliência e conteinerização.

## 🛠️ Tecnologias e Ferramentas

- **Framework:** [NestJS 11](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Dados:** PostgreSQL 16
- **Observabilidade & Logs:** Winston (`nest-winston`)
- **Health Checks:** `@nestjs/terminus`
- **Rate Limiting:** `@nestjs/throttler` (100 req/min por IP)
- **Testes:** Jest (Unitários e E2E)
- **Infraestrutura:** Docker & Docker Compose, pgAdmin 4

## 📌 Funcionalidades Principais

### 🔐 Autenticação & Segurança

- Registo (`/auth/signup`) e autenticação (`/auth/signin`) com tokens JWT (`Access Token` e `Refresh Token` em hash argon2).
- Fluxo de redefinição e recuperação de palavra-passe (`/auth/password_reset_request` e `/auth/password_reset`).
- Ativação, confirmação e validação de Autenticação Multifator (MFA).
- Encerramento de sessão (`/auth/logout`) com invalidação de refresh tokens.
- **Rate Limiting Global:** Proteção contra ataques de força bruta via `@nestjs/throttler`.

### 💰 Carteiras, Depósitos & Transações

- **Consulta de Carteira:** Obtenção do `wallet_id` e saldo atual (`GET /wallet`).
- **Depósitos:** Inserção de saldo na carteira (`POST /wallet/deposit`).
- **Extrato Financeiro:** Listagem de débitos e créditos da carteira (`GET /wallet/transactions`).
- **Transferências:** Transferências financeiras atómicas entre carteiras com débito condicional no banco (`POST /transactions/create`).
- **Estorno (_Reversal_):** Sistema de reversão de transações atómico com validação de autorização e estado da transação (`POST /transactions/:id/reversal`).

### 📊 Observabilidade & Resiliência

- **Logging Global:** Implementação centralizada via `WinstonLogger`, registo automático de requisições HTTP e persistência de erros em ficheiro local (`logs/error.log`).
- **Health Checks:** Endpoint de monitorização `/health` com `PrismaHealthIndicator` para verificação contínua da saúde da base de dados.

## 📁 Estrutura do Projecto

```text
src/
├── app.module.ts
├── main.ts
├── infra/
│   ├── database/        # Conexão e serviços Prisma (PrismaTransactionManager)
│   ├── filters/         # AppErrorFilter global para tratamento de exceções
│   ├── interceptors/    # LoggingInterceptor HTTP
│   └── logger/          # Configuração e transportes do Winston
└── modules/
    ├── auth/            # Módulo de Autenticação, JWT e MFA
    ├── business/        # Casos de uso de Transações e Carteiras (Wallet & Transactions)
    └── health/          # Módulo de Health Check (@nestjs/terminus)
```

## 🚀 Como Executar

### 📋 Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [Node.js](https://nodejs.org/) (v18+)

### 🐳 Execução via Docker (Recomendado)

1. Clone o repositório e aceda à pasta raiz:

   ```bash
   git clone <url-do-repositorio>
   cd wallet
   ```

2. Copie o ficheiro de exemplo de variáveis de ambiente para criar o `.env`:

   ```bash
   cp .env.example .env
   ```

   *Exemplo de configuração (`.env`):*

   ```env
   NODE_ENV=development
   PORT=3333
   DATABASE_URL="postgresql://postgres:4l9u2i7s@localhost:5433/transaction_wallet?schema=public"
   FRONTEND_LOCAL=http://localhost:3000
   ```

3. Suba os serviços conteinerizados:

   ```bash
   docker compose up --build -d
   ```

4. Execute as migrações do Prisma para estruturar a base de dados:

   ```bash
   npx prisma migrate dev
   ```

5. Verifique se os containers estão ativos:

   ```bash
   docker ps
   ```

#### 🌐 Serviços Disponíveis

| Serviço          | URL / Porta                     | Credenciais Padrão          |
| :--------------- | :----------------------------- | :-------------------------- |
| **API NestJS**   | `http://localhost:3333`         | -                           |
| **Health Check** | `http://localhost:3333/health` | -                           |
| **pgAdmin 4**    | `http://localhost:5050`         | `admin@admin.com` / `admin` |
| **PostgreSQL**   | `localhost:5433` *(host)*      | `postgres` / `4l9u2i7s`     |

## 🩺 Endpoint de Health Check

O endpoint `/health` utiliza o `@nestjs/terminus` para validar o estado da ligação ao PostgreSQL via Prisma.

**Requisição:**

```http
GET /health HTTP/1.1
Host: localhost:3333
```

**Resposta de Sucesso (`200 OK`):**

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

## 🧪 Execução de Testes

Os testes unitários e de ponta a ponta (*End-to-End*) cobrem toda a suite de autenticação, MFA, operações de carteira (depósito e extrato), transferências atómicas e estornos.

```bash
# Testes Unitários
npm run test

# Testes E2E
npm run test:e2e
```

Exemplo de saída esperada (E2E):

```text
 PASS  test/app.e2e-spec.ts
  E2E Complete Suite - Auth & Transactions
    ✓ /auth/signup (POST) - deve registrar um novo utilizador
    ✓ /auth/signin (POST) - deve autenticar o utilizador e retornar tokens
    Password Reset Flow
      ✓ /auth/password_reset_request (POST) - deve solicitar recuperação de palavra-passe
      ✓ /auth/password_reset (POST) - deve redefinir a palavra-passe com sucesso
    MFA Validation Flow
      ✓ /auth/validate_mfa (POST) - deve validar o código MFA com sucesso
    Token Refresh & Logout Flow
      ✓ /auth/refresh_token (POST) - deve renovar o access token
      ✓ /auth/mfa_confirm (POST) - deve confirmar e ativar o MFA com sucesso
      ✓ /auth/logout (POST) - deve terminar a sessão com sucesso
    Wallet & Deposit Flow
      ✓ /wallet (GET) - deve retornar as informações da carteira e saldo
      ✓ /wallet/deposit (POST) - deve efetuar um depósito na carteira
      ✓ /wallet/transactions (GET) - deve listar o extrato de transações
    Transaction Create Flow (E2E)
      ✓ /transactions/create (POST) - deve criar uma transferência com sucesso entre carteiras
      ✓ /transactions/create (POST) - deve retornar erro ao tentar transferir valor superior ao saldo
      ✓ /transactions/:id/reversal (POST) - deve reverter uma transação com sucesso
      ✓ /transactions/:id/reversal (POST) - deve retornar erro ao tentar reverter uma transação já revertida
      ✓ /transactions/:id/reversal (POST) - deve retornar 403 se um utilizador não-remetente tentar o estorno
```

## 📜 Licença

Este projeto é disponibilizado para fins de avaliação e testes técnicos.
