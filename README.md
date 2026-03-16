# BeTalent Back-end Challenge - Nivel 2 (AdonisJS)

API RESTful com MySQL e dois gateways de pagamento com autenticacao e fallback por prioridade.

## Requisitos

- Node.js 20.x ou 22.x
- MySQL 8+
- Docker (opcional)

## Instalacao local

1. Instale dependencias:

```bash
npm install
```

2. Configure o `.env` (use o `.env.example` como base).

3. Rode migrations e seeders:

```bash
node ace migration:run
node ace db:seed
```

4. Suba a API:

```bash
npm run dev
```

## Docker

```bash
docker compose up --build
```

Servicos:

- MySQL em `localhost:3306`
- Gateways em `localhost:3001` e `localhost:3002`
- API em `http://localhost:3333`

## Gateways

Seed inicial cria:

- `gateway_1` (prioridade 1)
- `gateway_2` (prioridade 2)

## Autenticacao

Token via `POST /api/v1/auth/login`. Use `Authorization: Bearer <token>` nas rotas privadas.

## Roles

Roles: `ADMIN`, `MANAGER`, `FINANCE`, `USER`.

`signup` cria usuario `USER`. Para criar o primeiro `ADMIN`:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

## Rotas

Base: `/api/v1`

Publicas:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /purchases`

Privadas (auth):

- `POST /auth/logout`
- `GET /account/profile`
- `GET /clients`
- `GET /clients/:id`
- `GET /transactions`
- `GET /transactions/:id`

Privadas (ADMIN):

- `GET /gateways`
- `PATCH /gateways/:id/status`
- `PATCH /gateways/:id/priority`
- `CRUD /users`

Privadas (ADMIN, MANAGER):

- `CRUD /products`

Privadas (ADMIN, FINANCE):

- `POST /transactions/:id/refund`

## Exemplo de compra

`POST /api/v1/purchases`

```json
{
  "productId": 1,
  "quantity": 2,
  "clientName": "Tester",
  "clientEmail": "tester@email.com",
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```

## Testes

```bash
npm test
```

O arquivo `.env.test` usa MySQL. No Docker Compose o banco `betalent_test` e criado automaticamente.

No Windows, o runner pode falhar ao encerrar. Use:

```bash
npm run test:windows
```

Para rodar no Docker:

```bash
npm run test:docker
```

## Observacoes

- Valor da compra = `products.amount * quantity`.
- Se o Gateway 1 falhar, tenta o Gateway 2.
- Em caso de sucesso em qualquer gateway, retorna sucesso.
