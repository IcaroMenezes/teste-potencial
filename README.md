# API Banco Digital

API completa de banco digital desenvolvida com NestJS, incluindo autenticação JWT, gerenciamento de contas digitais, transações internas e externas, e sistema de auditoria.

## Funcionalidades

### 1. Autenticação e Autorização
- **POST /auth/register** - Cadastro de usuários (nome, email, senha, cpf; perfis USER/ADMIN)
- **POST /auth/login** - Login e obtenção de token JWT
- Guards JWT para proteção de rotas
- Hash de senhas com bcrypt
- Validação de email único e CPF válido via regex

### 2. Conta Digital
- **POST /accounts** - Criação de conta (protegido, 1 conta por usuário, número único UUID, saldo inicial 0)
- **PATCH /accounts/:id/status** - Alteração de status da conta (apenas ADMIN)
- Relação 1:1 entre Account e User
- Status: ATIVO/INATIVO

### 3. Transações
- **POST /transactions/deposit/:accountId** - Depósito (valor > 0, atualiza saldo)
- **POST /transactions/withdraw/:accountId** - Saque (valida saldo suficiente)
- **POST /transactions/transfer/internal** - Transferência interna (valida saldo e conta destino ativa)
- **POST /transactions/transfer/external** - Transferência externa (valida banco via BrasilAPI)
- **GET /transactions/:accountId** - Histórico de transações

### 4. Auditoria e Segurança
- Log de todas as operações (usuário, endpoint, método, payload, timestamp)
- Validações de negócio (valor > 0, contas ativas, saldo suficiente)
- Tratamento global de exceções
- Arquitetura SOLID com serviços isolados

## Tecnologias

- NestJS
- TypeORM
- SQLite (banco de dados)
- JWT (autenticação)
- bcrypt (hash de senhas)
- class-validator (validação de DTOs)
- axios (integração com BrasilAPI)
- Swagger/OpenAPI (documentação da API)

## Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run start:dev

# Build para produção
npm run build
npm run start:prod
```

## Documentação da API (Swagger)

Após iniciar a aplicação, a documentação Swagger estará disponível em:

**http://localhost:3000/api**

A documentação interativa permite:
- Visualizar todos os endpoints disponíveis
- Testar requisições diretamente no navegador
- Ver exemplos de requisições e respostas
- Autenticar usando JWT Bearer Token

## Estrutura do Projeto

```
src/
├── auth/              # Módulo de autenticação
│   ├── dto/          # DTOs de registro e login
│   ├── entities/     # Entidade User
│   ├── guards/       # Guards JWT e Roles
│   ├── strategies/   # Estratégia JWT
│   └── decorators/   # Decorators personalizados
├── accounts/         # Módulo de contas
│   ├── dto/          # DTOs de conta
│   ├── entities/     # Entidade Account
│   └── ...
├── transactions/     # Módulo de transações
│   ├── dto/          # DTOs de transações
│   ├── entities/     # Entidade Transaction
│   ├── services/     # Serviços (ex: validação de banco)
│   └── ...
├── audit/            # Módulo de auditoria
│   ├── entities/     # Entidade AuditLog
│   └── interceptors/ # Interceptor de auditoria
└── common/           # Recursos compartilhados
    └── filters/      # Filtros de exceção
```

## Exemplos de Uso

### 1. Registrar Usuário

```bash
POST /auth/register
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "senha123",
  "cpf": "123.456.789-00",
  "role": "USER"
}
```

### 2. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "senha": "senha123"
}

# Resposta:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Criar Conta

```bash
POST /accounts
Authorization: Bearer {token}

# Resposta:
{
  "id": "uuid",
  "numero": "uuid",
  "saldo": 0,
  "status": "ATIVO",
  ...
}
```

### 4. Depósito

```bash
POST /transactions/deposit/{accountId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "valor": 1000.00
}
```

### 5. Transferência Externa

```bash
POST /transactions/transfer/external
Authorization: Bearer {token}
Content-Type: application/json

{
  "origemId": "uuid-da-conta-origem",
  "valor": 500.00,
  "banco": "001",
  "agencia": "1234",
  "conta": "567890",
  "cpfDestino": "987.654.321-00"
}
```

## Validações

- **Email**: Deve ser único e válido
- **CPF**: Formato XXX.XXX.XXX-XX e único
- **Senha**: Mínimo 6 caracteres
- **Valor**: Deve ser maior que zero
- **Conta**: Deve estar ativa para operações
- **Saldo**: Deve ser suficiente para saques e transferências
- **Banco**: Validado via BrasilAPI

## Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- Tokens JWT com expiração de 24h
- Rotas protegidas com Guards JWT
- Validação de propriedade (usuário só acessa suas próprias contas)
- Auditoria de todas as operações

## Banco de Dados

O projeto usa SQLite por padrão. O banco de dados será criado automaticamente na primeira execução (`banco-digital.db`).

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
JWT_SECRET=your-secret-key-change-in-production
```

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## Licença

MIT

