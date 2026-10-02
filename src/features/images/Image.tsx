import { useCallback, useState } from 'react'
import { cn } from '#/lib/utils'

type Props = {
  src: string
  alt: string
  /** Intrinsic size of the master. Always required: reserves space, no layout shift. */
  width: number
  height: number
  blurDataUrl?: string
  /** Hero / LCP image: eager + fetchpriority high. One per page. */
  priority?: boolean
  /** Above the fold but not the LCP image: eager, normal priority. */
  eager?: boolean
  sizes?: string
  className?: string
}

const CDN_WIDTHS = [240, 360, 480, 640, 800, 1080, 1440]

/** Netlify Image CDN URL at one width; the height follows the master's ratio. */
const cdnUrl = (src: string, w: number) =>
  `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}`

/**
 * The only way to render a product image. Delivered through the Netlify Image CDN
 * (so Supabase serves each variant once), blur placeholder behind, fades in on load.
 */
export function Image({
  src,
  alt,
  width,
  height,
  blurDataUrl,
  priority,
  eager,
  sizes,
  className,
}: Props) {
  const [loaded, setLoaded] = useState(false)

  // The image may finish loading before hydration, so check `complete` on mount.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setLoaded(true)
  }, [])

  const common = {
    src,
    alt,
    width,
    height,
    ref,
    onLoad: () => setLoaded(true),
    className: cn(
      'h-auto w-full transition-opacity duration-200 ease-(--ease-out)',
      loaded ? 'opacity-100' : 'opacity-0',
      className,
    ),
    style: blurDataUrl
      ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: 'cover' }
      : undefined,
    decoding: 'async' as const,
    loading: priority || eager ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : undefined,
  }

  // `/.netlify/images` only exists on Netlify (or `netlify dev`): use the raw WebP locally.
  if (import.meta.env.DEV) return <img {...common} sizes={sizes} />

  // width and height stay on the element (aspect ratio before load); the CDN serves the sizes.
  const widths = CDN_WIDTHS.filter((w) => w <= width * 2)
  if (!widths.length) widths.push(width)
  const srcSet = widths.map((w) => `${cdnUrl(src, w)} ${w}w`).join(', ')
  return (
    <img
      {...common}
      src={cdnUrl(src, widths[Math.min(2, widths.length - 1)])}
      srcSet={srcSet}
      sizes={sizes ?? `(min-width: ${width}px) ${width}px, 100vw`}
    />
  )
}
