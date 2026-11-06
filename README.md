# 💳 Transaction Wallet API

> API robusta em NestJS e Prisma ORM para gestão de carteiras digitais, transações financeiras, fluxos avançados de autenticação (MFA e redefinição de palavra-passe) e estornos, focada em observabilidade, resiliência e conteinerização.

## 🛠️ Tecnologias e Ferramentas

- **Framework:** [NestJS 11](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Dados:** PostgreSQL 16
- **Observabilidade & Logs:** Winston (`nest-winston`)
- **Health Checks:** `@nestjs/terminus`
- **Testes:** Jest (E2E)
- **Infraestrutura:** Docker & Docker Compose, pgAdmin 4

## 📌 Funcionalidades Principais

### 🔐 Autenticação & Segurança

- Registro (`/auth/signup`) e autenticação (`/auth/signin`) com tokens JWT (`Access Token` e `Refresh Token`).
- Fluxo de redefinição e recuperação de palavra-passe.
- Ativação, confirmação e validação de Autenticação Multifator (MFA).
- Encerramento de sessão (`/auth/logout`) com invalidação de refresh tokens.

### 💰 Transações & Carteiras

- Transferências financeiras entre carteiras com verificação de saldo em tempo real.
- Sistema de estorno (_Reversal_) com validações de regra de negócio (prevenção de estornos duplicados e verificação de autorização do remetente).

### 📊 Observabilidade & Resiliência

- **Logging Global:** Implementação centralizada via `WinstonLogger`, registo automático de requisições HTTP e persistência de erros em ficheiro local (`logs/error.log`).
- **Health Checks:** Endpoint de monitorização `/health` com `PrismaHealthIndicator` para verificação contínua da saúde da base de dados.

## 📁 Estrutura do Projecto

```text
src/
├── app.module.ts
├── main.ts
├── infra/
│   ├── database/       # Conexão e serviços Prisma
│   ├── interceptors/    # LoggingInterceptor HTTP
│   └── logger/          # Configuração e transportes do Winston
└── modules/
    ├── auth/            # Módulo de Autenticação, JWT e MFA
    ├── business/        # Casos de uso de Transações e Carteiras
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

2. Configure o ficheiro `.env` na raiz do projeto. Existem outras variáveis, as quais pode se procurar por process.env.:

   ```env
   NODE_ENV=development
   PORT=3333
   DATABASE_URL=
   ```

3. Suba os serviços conteinerizados:

   ```bash
   docker compose up --build -d
   ```

4. Verifique se os containers estão ativos:
   ```bash
   docker ps
   ```

#### 🌐 Serviços Disponíveis

| Serviço          | URL / Porta                    | Credenciais Padrão          |
| :--------------- | :----------------------------- | :-------------------------- |
| **API NestJS**   | `http://localhost:3333`        | -                           |
| **Health Check** | `http://localhost:3333/health` | -                           |
| **pgAdmin 4**    | `http://localhost:5050`        | `admin@admin.com` / `admin` |
| **PostgreSQL**   | `localhost:5433` _(host)_      | `postgres` / `4l9u2i7s`     |

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

## 🧪 Execução de Testes E2E

Os testes de ponta a ponta (_End-to-End_) cobrem toda a suite de autenticação, MFA, transferências e estornos.

Os testes correm na máquina host e comunicam com a base de dados no Docker através da porta mapeada `5433`.

Execute os testes E2E:

```bash
npm run test:e2e
```

Exemplo de saída esperada:

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
    Transaction Create Flow (E2E)
      ✓ /transactions (POST) - deve criar uma transferência com sucesso entre carteiras
      ✓ /transactions (POST) - deve retornar erro ao tentar transferir valor superior ao saldo
      ✓ /transactions/:id/reversal (POST) - deve reverter uma transação com sucesso
      ✓ /transactions/:id/reversal (POST) - deve retornar erro ao tentar reverter uma transação já revertida
      ✓ /transactions/:id/reversal (POST) - deve retornar 403 se um utilizador não-remetente tentar o estorno
```

## 📜 Licença

Este projeto é disponibilizado para fins de avaliação e testes técnicos.
