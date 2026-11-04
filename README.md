# 💈 Barber SaaS API

API backend para uma plataforma SaaS de gerenciamento de barbearias, desenvolvida com **Node.js, NestJS, TypeScript, PostgreSQL, Prisma e Docker**.

O projeto foi pensado para atender múltiplas barbearias em uma mesma plataforma, utilizando uma arquitetura multi-tenant baseada em **entities**, permitindo que cada estabelecimento tenha seus próprios usuários, clientes, configurações e dados isolados.

> 🚧 Projeto em desenvolvimento

---

## 📌 Sobre o projeto

O **Barber SaaS** é uma API para gerenciamento de barbearias, desenvolvida com foco em organização de domínio, segurança, escalabilidade e separação de dados entre diferentes estabelecimentos.

A aplicação utiliza containers Docker para padronizar o ambiente de desenvolvimento e facilitar a execução dos serviços necessários, como banco de dados e cache.

A proposta é disponibilizar uma base backend para funcionalidades como:

- 👤 Gerenciamento de usuários e perfis
- 🏪 Gerenciamento de barbearias
- 👥 Gerenciamento de clientes
- 💇 Profissionais e membros da equipe
- 🔐 Autenticação e autorização
- 📅 Agendamento de serviços
- 💈 Serviços oferecidos pela barbearia
- 📍 Endereço e localização dos estabelecimentos
- 💳 Planos e estrutura SaaS
- 🔑 Controle de acesso baseado em papéis
- 🔗 Integrações com serviços externos

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular utilizando os recursos do NestJS, buscando manter responsabilidades bem definidas entre os diferentes domínios da aplicação.

A aplicação utiliza o conceito de **multi-tenancy**, onde os dados relacionados a uma barbearia são vinculados a uma `Entity`.

Os serviços de infraestrutura podem ser executados em containers Docker, mantendo o ambiente padronizado entre diferentes máquinas e ambientes.

Exemplo simplificado:

```text
                    ┌─────────────────┐
                    │      Client     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      API        │
                    │    NestJS       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Auth    │   │  Entity  │   │ Customer │
        └──────────┘   └──────────┘   └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │    Docker       │
                    └─────────────────┘
```

---

## 🧰 Tecnologias

### Backend

- **Node.js**
- **NestJS**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**

### Infraestrutura e ferramentas

- **Docker**
- **Docker Compose**
- **Redis**
- **JWT**
- **Git**
- **ESLint**
- **Prettier**

---

## 🔐 Autenticação

A API possui uma estrutura de autenticação baseada em tokens, com separação entre diferentes tipos de credenciais e níveis de acesso.

Entre os conceitos utilizados estão:

- Access Token
- Refresh Token
- Challenge Token
- MFA
- Controle de sessão
- Roles e permissões
- Proteção de rotas
- Identificação da entidade do usuário autenticado

A estrutura permite que um mesmo usuário possa estar relacionado a diferentes entidades, mantendo o contexto da barbearia durante a utilização da API.

---

## 👥 Controle de acesso

O sistema utiliza **Role-Based Access Control (RBAC)** para controlar as funcionalidades disponíveis para cada usuário.

Entre os papéis previstos estão:

```text
DONO
ADMINISTRADOR
RECEPCIONISTA
BARBEIRO
CLIENTE
```

Também existe uma camada de **Super User**, destinada ao gerenciamento administrativo da plataforma.

---

## 🏪 Multi-tenancy

Um dos principais objetivos arquiteturais do projeto é permitir que a mesma aplicação atenda diversas barbearias.

A estrutura utiliza uma `Entity` como contexto do estabelecimento.

Exemplo:

```text
Entity
 ├── Members
 ├── Customers
 ├── Services
 ├── Appointments
 ├── Address
 └── Settings
```

Isso permite manter os dados de diferentes estabelecimentos separados dentro da mesma infraestrutura.

---

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** como banco de dados relacional e **Prisma** como ORM.

O PostgreSQL pode ser executado em um container Docker, evitando a necessidade de instalar e configurar o banco diretamente na máquina local.

O schema é organizado utilizando relacionamentos entre entidades, perfis, identidades, membros e clientes.

Exemplo simplificado:

```text
Identity
   │
   └── Profile
          │
          └── Member
                 │
                 └── Entity
                        │
                        ├── Customer
                        ├── Address
                        └── ...
```

---

## 📍 Localização

As barbearias possuem informações de endereço e localização, permitindo trabalhar futuramente com funcionalidades como:

- Busca de barbearias próximas
- Exibição em mapas
- Cálculo de distância
- Filtros por localização

A estrutura de endereço suporta informações como:

```text
CEP
Rua
Número
Bairro
Cidade
Estado
País
Complemento
Latitude
Longitude
```

---

## 🚀 Funcionalidades

### Implementadas

- [x] Estrutura inicial da API
- [x] Autenticação
- [x] Access Token
- [x] Refresh Token
- [x] Challenge Token
- [x] Estrutura de MFA
- [x] Controle de acesso por roles
- [x] Estrutura multi-tenant
- [x] Gerenciamento de entidades
- [x] Perfis de usuário
- [x] Estrutura de membros
- [x] Clientes
- [x] Endereço e localização
- [x] Configuração da infraestrutura com Docker

### Em desenvolvimento

- [ ] Agendamentos
- [ ] Serviços
- [ ] Profissionais
- [ ] Disponibilidade de horários
- [ ] Notificações
- [ ] Planos SaaS
- [ ] Integração com pagamentos
- [ ] Integrações externas
- [ ] Dashboard administrativo

---

## 📂 Estrutura do projeto

Uma visão simplificada da organização:

```text
src/
├── modules/
│   ├── auth/
│   ├── customer/
│   ├── entity/
│   ├── member/
│   ├── profile/
│   └── ...
│
├── shared/
│   ├── errors/
│   ├── guards/
│   ├── decorators/
│   └── ...
│
├── infra/
│   └── database/
│       └── prisma/
│
└── main.ts

docker-compose.yml
Dockerfile
.env.example
```

A organização pode evoluir conforme novos domínios forem adicionados ao sistema.

---

## ⚙️ Requisitos

Antes de executar o projeto, você precisará ter instalado:

- Docker
- Docker Compose
- Git

Para executar a aplicação diretamente fora de um container, também será necessário:

- Node.js
- Yarn ou npm

O PostgreSQL e o Redis podem ser executados através do Docker Compose.

---

## 🚀 Executando o projeto com Docker

Clone o repositório:

```bash
git clone <repository-url>

cd barber-saas-api
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Revise as variáveis do arquivo `.env`, especialmente a URL de conexão com o banco de dados:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/barber_saas"
```

Suba os containers da aplicação e da infraestrutura:

```bash
docker compose up -d
```

Verifique o status dos containers:

```bash
docker compose ps
```

Execute as migrations dentro do container da aplicação:

```bash
docker compose exec app yarn prisma migrate deploy
```

Gere o Prisma Client:

```bash
docker compose exec app yarn prisma generate
```

A aplicação estará disponível conforme a porta configurada no `docker-compose.yml`.

Para acompanhar os logs:

```bash
docker compose logs -f app
```

---

## 🐳 Docker

O projeto utiliza Docker para executar a aplicação e seus serviços de infraestrutura de forma isolada e padronizada.

Serviços previstos no Docker Compose:

```text
app
├── API NestJS
├── PostgreSQL
└── Redis
```

Iniciar os serviços:

```bash
docker compose up -d
```

Iniciar reconstruindo as imagens:

```bash
docker compose up -d --build
```

Parar os serviços:

```bash
docker compose down
```

Parar os serviços e remover os volumes:

```bash
docker compose down -v
```

Verificar os containers em execução:

```bash
docker compose ps
```

Visualizar os logs de todos os serviços:

```bash
docker compose logs -f
```

Visualizar os logs de um serviço específico:

```bash
docker compose logs -f app
```

A execução com volumes permite preservar os dados do PostgreSQL e do Redis entre reinicializações dos containers.

---

## 🚀 Executando localmente sem Docker

Caso prefira executar apenas a aplicação diretamente na máquina, instale as dependências:

```bash
yarn install
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Nesse caso, o PostgreSQL e o Redis deverão estar disponíveis localmente ou em containers separados.

Execute as migrations:

```bash
yarn prisma migrate dev
```

Inicie a aplicação em modo de desenvolvimento:

```bash
yarn start:dev
```

Para produção:

```bash
yarn start:prod
```

---

## 🧪 Testes

Executar testes unitários:

```bash
yarn test
```

Executar testes E2E:

```bash
yarn test:e2e
```

Executar testes com coverage:

```bash
yarn test:cov
```

Para executar os testes dentro do container da aplicação:

```bash
docker compose exec app yarn test
```

---

## 🔄 Migrations

Criar uma nova migration localmente:

```bash
yarn prisma migrate dev --name nome_da_migration
```

Criar uma nova migration dentro do container:

```bash
docker compose exec app yarn prisma migrate dev --name nome_da_migration
```

Aplicar migrations em um ambiente de produção:

```bash
docker compose exec app yarn prisma migrate deploy
```

Gerar o Prisma Client:

```bash
yarn prisma generate
```

Ou, utilizando Docker:

```bash
docker compose exec app yarn prisma generate
```

Visualizar o banco através do Prisma Studio:

```bash
yarn prisma studio
```

Para acessar o Prisma Studio utilizando o container:

```bash
docker compose exec app yarn prisma studio --hostname 0.0.0.0
```

---

## 🎯 Objetivos do projeto

Além de ser uma aplicação voltada para gerenciamento de barbearias, o projeto também tem como objetivo explorar na prática conceitos de desenvolvimento backend, como:

- Arquitetura modular
- Multi-tenancy
- Autenticação segura
- RBAC
- Modelagem relacional
- APIs REST
- Processamento assíncrono
- Integração entre serviços
- Containerização com Docker
- Orquestração com Docker Compose
- Escalabilidade
- Boas práticas de desenvolvimento
- Organização de domínio

---

## 🗺️ Roadmap

```text
[x] Estrutura base
[x] Auth
[x] Multi-tenancy
[x] Profiles
[x] Members
[x] Customers
[x] Docker
[ ] Services
[ ] Professionals
[ ] Scheduling
[ ] Notifications
[ ] Payments
[ ] SaaS Plans
[ ] Production deployment
```

---

## 👨‍💻 Autor

Desenvolvido por **Luís Antônio dos Santos Silva**.

Backend Developer focado em **Node.js, NestJS, TypeScript, APIs REST, PostgreSQL e Docker**.

---

## 📄 Licença

Este projeto está sob a licença MIT.
