import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { processImage } from '#/features/images/process'

async function fixture(width: number, height: number) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 180, g: 83, b: 47 },
    },
  })
    .png()
    .toBuffer()
}

describe('processImage', () => {
  it('converts to WebP and caps width at 1600', async () => {
    const out = await processImage(await fixture(2400, 1800))
    const meta = await sharp(out.master).metadata()
    expect(meta.format).toBe('webp')
    expect(out.width).toBe(1600)
    expect(out.height).toBe(1200)
  })

  it('never upscales small images', async () => {
    const out = await processImage(await fixture(400, 500))
    expect(out.width).toBe(400)
    expect(out.height).toBe(500)
  })

  it('returns a small WebP blur data url', async () => {
    const out = await processImage(await fixture(800, 800))
    expect(out.blurDataUrl.startsWith('data:image/webp;base64,')).toBe(true)
    expect(out.blurDataUrl.length).toBeLessThan(1000)
  })
})
