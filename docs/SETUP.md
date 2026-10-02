# Scentpocket: External services setup runbook

Do these in order. Tick them off in [context/README.md](../context/README.md) Phase 0 and Phase 2.

URLs used below:
* Local: `http://localhost:3000`
* Netlify: `https://scentpocket.netlify.app` (or whatever Netlify assigns)
* Domain: `https://scentpocket.com.ng` (once bought)
* Supabase: `https://<project-ref>.supabase.co`

---

## 1. Namecheap (domain)

1. Bought `scentpocket.com.ng` (Whogohost).
2. Buy 1 year. **Turn off auto renew immediately** (renewal on `.shop` is about $49).
3. Leave DNS on Namecheap for now. Netlify and Mailgun records get added below.

## 2. Supabase

1. New project `scentpocket`, region closest to Lagos (EU, e.g. Frankfurt or London). Save the DB password.
2. **Project Settings → Database → Connection string**:
   * Transaction pooler (port 6543) → `DATABASE_URL`
   * Session pooler or direct (port 5432) → `DIRECT_URL`
3. **Project Settings → API keys**: publishable (anon) key → `VITE_SUPABASE_PUBLISHABLE_KEY`; secret (service role) key → `SUPABASE_SECRET_KEY`. Project URL → `VITE_SUPABASE_URL`.
4. **Storage → New bucket** `products`, Public: on.
5. After the first migration: **Table editor** should show the RLS badge on every table. Check with the anon key that `select * from orders` returns nothing.

## 3. Netlify (first deploy, before OAuth)

1. Push the scaffold to GitHub (`Emmanuel-Xs/scentpocket`).
2. Netlify → Add new site → Import from GitHub → pick the repo. Netlify detects TanStack Start.
3. Add env vars from `.env.example` (all except test ones).
4. Deploy. Confirm `/privacy` and `/terms` load on the live URL.
5. Later, Domain management → add `scentpocket.com.ng` and point the registrar nameservers at Netlify DNS.
6. Add `[images] remote_images` for the Supabase storage URL in `netlify.toml` (see TRD §9) and confirm `/.netlify/images?url=...` works on the deploy.

## 4. Google Cloud Console (OAuth client)

1. Create project `Scentpocket`.
2. **Google Auth Platform → Branding**: app name `Scentpocket`, user support email (your Gmail), developer contact email. Homepage, privacy and terms URLs from the live Netlify site. **Skip the logo** (adding one can trigger brand verification). Authorized domains: `netlify.app` is not allowed as yours, so add `scentpocket.com.ng` once bought, and `<project-ref>.supabase.co` as Supabase docs describe.
3. **Audience**: User type External.
4. **Data access**: scopes `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` only.
5. **Clients → Create client → Web application**:
   * Authorized JavaScript origins: `http://localhost:3000`, the Netlify URL, `https://scentpocket.com.ng`.
   * Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` (this one only; Google redirects to Supabase, Supabase redirects to us).
6. Copy client ID and secret.
7. **Audience → Publish app → In production.** Without this, only listed test users can sign in. Basic scopes need no review.

## 5. Supabase Auth (Google provider)

1. **Authentication → Sign In / Providers → Google**: enable, paste client ID and secret.
2. **Authentication → URL Configuration**:
   * Site URL: production URL.
   * Redirect URLs: `http://localhost:3000/**`, `https://*--scentpocket.netlify.app/**` (deploy previews), `https://scentpocket.netlify.app/**`, `https://scentpocket.com.ng/**`.
3. Test sign in locally and on Netlify with a Gmail that is not yours.

Known cosmetic issue: the Google popup says "continue to `<project-ref>.supabase.co`". Fixing it needs Supabase's paid custom domain. Ignore for the demo.

## 6. Gmail SMTP (fallback email)

1. Google account → Security → turn on 2 Step Verification.
2. App passwords → create `Scentpocket` → 16 character password → `SMTP_APP_PASSWORD`. Your Gmail → `SMTP_USER`.

## 7. Mailgun

**Now (sandbox):**
1. Sign up, note the sandbox domain (`sandboxXXXX.mailgun.org`) and region (US or EU).
2. Sending → API keys → create a key → `MAILGUN_API_KEY`.
3. Add up to 5 authorized recipients (your Gmail, a test Gmail). Each must click the confirmation email.
4. `MAILGUN_DOMAIN` = sandbox domain, `MAILGUN_FROM` = `Scentpocket <postmaster@sandboxXXXX.mailgun.org>`.

**After buying the domain:**
1. Add domain `mg.scentpocket.com.ng` in Mailgun.
2. In Namecheap Advanced DNS, add the records Mailgun shows (SPF TXT, DKIM TXT, optional MX and tracking CNAME) on the `mg` host.
3. Click Verify (DNS can take minutes to hours).
4. Switch `MAILGUN_DOMAIN` to `mg.scentpocket.com.ng` and `MAILGUN_FROM` to `Scentpocket <orders@mg.scentpocket.com.ng>`.

## 8. Local env

Copy `.env.example` to `.env`, fill everything, run `pnpm db:migrate && pnpm db:seed`, then `pnpm dev`.
