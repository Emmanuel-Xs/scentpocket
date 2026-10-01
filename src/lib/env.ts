import { z } from 'zod'

const publicSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
})

const serverSchema = z.object({
  SITE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  ADMIN_EMAILS: z
    .string()
    .min(1)
    .transform((v) =>
      v
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_API_BASE: z.url().default('https://api.mailgun.net'),
  MAILGUN_FROM: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_APP_PASSWORD: z.string().optional(),
  TEST_DATABASE_URL: z.string().optional(),
})

export type PublicEnv = z.infer<typeof publicSchema>
export type ServerEnv = z.infer<typeof serverSchema>

function parse<T extends z.ZodType>(schema: T, source: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('\n  ')
    throw new Error(`Invalid ${label} environment variables:\n  ${issues}`)
  }
  return result.data
}

let publicEnv: PublicEnv | undefined
let serverEnv: ServerEnv | undefined

/** Safe in the browser: only VITE_ keys. */
export function getPublicEnv(): PublicEnv {
  publicEnv ??= parse(
    publicSchema,
    {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    'public',
  )
  return publicEnv
}

/** Server only. Validated on first use so builds don't need secrets. */
export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must not be called in the browser')
  }
  serverEnv ??= parse(serverSchema, process.env, 'server')
  return serverEnv
}
