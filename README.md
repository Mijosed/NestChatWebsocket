## Prérequis

- Node.js 20+
- Docker

## Comment lancer le projet

### 1. Backend

```bash
cd backend
npm install
```

Copie `.env.copy` en `.env` :

```bash
cp .env.copy .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
JWT_SECRET="change-this-secret"
```

Lance la base de données :

```bash
docker compose up -d
```

Applique les migrations :

```bash
npx prisma migrate dev
```

Lance le seed (données de test) :

```bash
npx prisma db seed
```

Démarre le serveur :

```bash
npm run start:dev
```

Le backend tourne sur `http://localhost:3000`.
La doc Swagger est disponible sur `http://localhost:3000/api`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur `http://localhost:3001`.

## Comptes de test

| Email | Username | Mot de passe |
|---|---|---|
| quentin@test.com | quentin | test1234 |
| mijose@test.com | mijose | test1234 |
| anthony@test.com | anthony | test1234 |