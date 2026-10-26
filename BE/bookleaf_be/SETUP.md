# BookLeaf BE — Quick Setup

## 1. Install dependencies
```bash
npm install
```

## 2. Create your .env
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `DATABASE_URL` — your MySQL connection string
- `JWT_SECRET` — any random string of 32+ characters
- `GEMINI_API_KEY` — your Gemini API key (or set `OPENAI_API_KEY` and change `activeProvider` to `gpt` in `src/config/ai.config.json`)

## 3. Apply the database schema
```bash
mysql -u root -p < database/migrations/001_init.sql
```

## 4. Generate Prisma client
```bash
npx prisma db pull
npx prisma generate
```

## 5. Seed the database
Import the data using the SQL inserts from the project documentation.
All users have password: `123456`

### Test accounts
| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | superadmin@bookleaf.com | 123456 |
| ADMIN | admin@bookleaf.com | 123456 |
| ADMIN | admin2@bookleaf.com | 123456 |
| AUTHOR | priya.sharma@email.com | 123456 |
| AUTHOR | rohit.kapoor@email.com | 123456 |
| AUTHOR | sneha.kulkarni@email.com | 123456 |
| AUTHOR | kavita.deshmukh@email.com | 123456 |

## 6. Start the server
```bash
npm run dev
```

Server runs on http://localhost:5000
Health check: http://localhost:5000/api/health

## 7. Run API tests
```bash
bash API_TESTS.sh
```
After the login calls, copy the tokens into the TOKEN_AUTHOR and TOKEN_ADMIN variables in API_TESTS.sh and re-run.
