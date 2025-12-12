# Exemplos de Requisições

Este arquivo contém exemplos práticos de como usar a API.

## 1. Autenticação

### Registrar Usuário Comum

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123",
    "cpf": "123.456.789-00"
  }'
```

### Registrar Administrador

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Admin",
    "email": "admin@example.com",
    "senha": "admin123",
    "cpf": "987.654.321-00",
    "role": "ADMIN"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. Contas

### Criar Conta

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer {seu_token_aqui}"
```

**Resposta:**
```json
{
  "id": "uuid-da-conta",
  "numero": "uuid-numero-conta",
  "saldo": 0,
  "status": "ATIVO",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "userId": "uuid-do-usuario"
}
```

### Alterar Status da Conta (ADMIN apenas)

```bash
curl -X PATCH http://localhost:3000/accounts/{accountId}/status \
  -H "Authorization: Bearer {token_admin}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INATIVO"
  }'
```

## 3. Transações

### Depósito

```bash
curl -X POST http://localhost:3000/transactions/deposit/{accountId} \
  -H "Authorization: Bearer {seu_token_aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 1000.00
  }'
```

### Saque

```bash
curl -X POST http://localhost:3000/transactions/withdraw/{accountId} \
  -H "Authorization: Bearer {seu_token_aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 500.00
  }'
```

### Transferência Interna

```bash
curl -X POST http://localhost:3000/transactions/transfer/internal \
  -H "Authorization: Bearer {seu_token_aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "origemId": "uuid-conta-origem",
    "destinoId": "uuid-conta-destino",
    "valor": 200.00
  }'
```

### Transferência Externa

```bash
curl -X POST http://localhost:3000/transactions/transfer/external \
  -H "Authorization: Bearer {seu_token_aqui}" \
  -H "Content-Type: application/json" \
  -d '{
    "origemId": "uuid-conta-origem",
    "valor": 300.00,
    "banco": "001",
    "agencia": "1234",
    "conta": "567890",
    "cpfDestino": "987.654.321-00"
  }'
```

**Nota:** O código do banco deve ser válido conforme a BrasilAPI. Exemplos:
- 001 - Banco do Brasil
- 033 - Santander
- 104 - Caixa Econômica Federal
- 237 - Bradesco
- 341 - Itaú

### Histórico de Transações

```bash
curl -X GET http://localhost:3000/transactions/{accountId} \
  -H "Authorization: Bearer {seu_token_aqui}"
```

**Resposta:**
```json
[
  {
    "id": "uuid-transacao",
    "tipo": "DEPOSIT",
    "valor": 1000.00,
    "saldoPos": 1000.00,
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-transacao-2",
    "tipo": "WITHDRAW",
    "valor": 500.00,
    "saldoPos": 500.00,
    "timestamp": "2024-01-01T01:00:00.000Z"
  }
]
```

## Fluxo Completo de Exemplo

1. **Registrar usuário:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","email":"maria@example.com","senha":"senha123","cpf":"111.222.333-44"}'
```

2. **Fazer login e salvar o token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com","senha":"senha123"}' | jq -r '.access_token')
```

3. **Criar conta:**
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer $TOKEN"
```

4. **Fazer depósito:**
```bash
curl -X POST http://localhost:3000/transactions/deposit/{accountId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"valor": 1000.00}'
```

5. **Ver histórico:**
```bash
curl -X GET http://localhost:3000/transactions/{accountId} \
  -H "Authorization: Bearer $TOKEN"
```

## Códigos de Banco Válidos (BrasilAPI)

Alguns exemplos de códigos de banco válidos:
- 001 - Banco do Brasil
- 033 - Santander
- 104 - Caixa Econômica Federal
- 237 - Bradesco
- 341 - Itaú
- 356 - Banco Real
- 422 - Banco Safra
- 748 - Banco Cooperativo Sicredi

