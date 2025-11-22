# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **PostgreSQL Database**: Set up Vercel Postgres (recommended)

## Step 1: Set Up Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Choose a database name (e.g., `healthcare-db`)
4. Select a region close to your users
5. Copy the connection string (starts with `postgresql://`)

## Step 2: Commit and Push Changes

All configuration files have been created. Now commit them to GitHub:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `aayushh38-byte/healthcare_app`
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend && npm install --prefix backend`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Vercel Postgres connection string |
   | `JWT_SECRET` | A strong random secret (e.g., generate with `openssl rand -base64 32`) |
   | `AI_PROVIDER` | `mock` |
   | `AI_MODEL` | `gpt-3.5-turbo` |
   | `NODE_ENV` | `production` |

5. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? healthcare-app
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string

vercel env add JWT_SECRET
# Paste a strong secret

vercel env add AI_PROVIDER
# Enter: mock

# Deploy to production
vercel --prod
```

## Step 4: Initialize Database

After deployment, you need to run migrations and seed the database:

1. **Connect to your Vercel Postgres database** using the connection string
2. **Run Prisma migrations locally** pointing to production database:
   ```bash
   cd backend
   # Temporarily set DATABASE_URL to your Vercel Postgres connection string
   DATABASE_URL="your-vercel-postgres-url" npx prisma db push
   DATABASE_URL="your-vercel-postgres-url" npm run seed
   ```

   Or use Vercel CLI:
   ```bash
   vercel env pull .env.production
   cd backend
   npx prisma db push
   npm run seed
   ```

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL (e.g., `https://healthcare-app.vercel.app`)
2. Test the following:
   - ✅ Homepage loads
   - ✅ Login with demo credentials: `demo@patient.com` / `password123`
   - ✅ Browse doctors
   - ✅ View doctor profiles
   - ✅ Book an appointment
   - ✅ Check symptom checker

## Troubleshooting

### API Routes Not Working

- Check Vercel function logs in the dashboard
- Verify environment variables are set correctly
- Ensure `DATABASE_URL` is accessible from Vercel

### Database Connection Errors

- Verify PostgreSQL connection string format: `postgresql://user:password@host:5432/database?sslmode=require`
- Check if database is in the same region as your Vercel deployment
- Ensure Prisma client is generated (should happen automatically via postinstall script)

### Build Failures

- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json` (not just devDependencies)
- Test build locally: `cd frontend && npm run build`

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `AI_PROVIDER` | AI provider (mock or openai) | `mock` |
| `AI_MODEL` | AI model to use | `gpt-3.5-turbo` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | `sk-...` |

## Monitoring

- **Logs**: View real-time logs in Vercel dashboard under "Deployments" → "Functions"
- **Analytics**: Enable Vercel Analytics for traffic insights
- **Errors**: Set up error tracking with Sentry or similar service

## Next Steps

- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and alerts
- [ ] Add SSL certificate (automatic with Vercel)
- [ ] Configure backup strategy for database
