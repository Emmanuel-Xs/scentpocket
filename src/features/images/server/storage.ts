import { createClient } from '@supabase/supabase-js'
import { getPublicEnv, getServerEnv } from '#/lib/env'
import { CACHE_CONTROL_SECONDS } from '../process'
import { PRODUCTS_BUCKET } from '../url'

/** Service role client: Storage only. App data goes through Drizzle. Server only. */
function storage() {
  return createClient(
    getPublicEnv().VITE_SUPABASE_URL,
    getServerEnv().SUPABASE_SECRET_KEY,
    {
      auth: { persistSession: false },
    },
  ).storage.from(PRODUCTS_BUCKET)
}

/** Uploads a WebP master with a one year cache header (egress stays low behind the image CDN). */
export async function uploadWebp(path: string, master: Buffer): Promise<void> {
  const { error } = await storage().upload(path, master, {
    contentType: 'image/webp',
    cacheControl: String(CACHE_CONTROL_SECONDS),
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
}

/** Best effort: a leftover file is harmless, a failed delete must not break the admin action. */
export async function removeFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  try {
    await storage().remove(paths)
  } catch {
    // ignore
  }
}
