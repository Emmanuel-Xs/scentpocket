import { inArray } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { productImages } from '#/db/schema'
import type { CardImage } from '#/features/catalog/types'
import { productImageUrl } from '#/features/images/url'

/** Photos (with size and blur) for the image paths an order's items snapshotted. */
export async function loadImagesByPath(
  db: Db,
  paths: string[],
): Promise<Map<string, CardImage>> {
  const wanted = [...new Set(paths.filter(Boolean))]
  if (wanted.length === 0) return new Map()
  const rows = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.path, wanted))
  return new Map(
    rows.map((r) => [
      r.path,
      {
        src: productImageUrl(r.path),
        width: r.width,
        height: r.height,
        blurDataUrl: r.blurDataUrl,
        alt: r.alt,
      },
    ]),
  )
}
