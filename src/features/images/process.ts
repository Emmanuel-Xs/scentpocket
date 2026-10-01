import sharp from 'sharp'

export const MASTER_MAX_WIDTH = 1600
export const MASTER_QUALITY = 80
export const BLUR_SIZE = 16
export const BLUR_QUALITY = 40
/** One year, immutable: filenames are uuids so they never change. */
export const CACHE_CONTROL_SECONDS = 31536000

export type ProcessedImage = {
  /** WebP master. Always upload with contentType image/webp. */
  master: Buffer
  width: number
  height: number
  /** `data:image/webp;base64,...`, ~200 bytes. */
  blurDataUrl: string
}

/** Node only. Turns any PNG/JPEG/WebP/AVIF input into a WebP master + blur placeholder. */
export async function processImage(
  input: Buffer | Uint8Array,
): Promise<ProcessedImage> {
  const base = sharp(input).rotate()

  const { data: master, info } = await base
    .clone()
    .resize({ width: MASTER_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: MASTER_QUALITY })
    .toBuffer({ resolveWithObject: true })

  const blur = await base
    .clone()
    .resize(BLUR_SIZE)
    .webp({ quality: BLUR_QUALITY })
    .toBuffer()

  return {
    master,
    width: info.width,
    height: info.height,
    blurDataUrl: `data:image/webp;base64,${blur.toString('base64')}`,
  }
}
