import { useCallback, useState } from 'react'
import { Image as UnpicImage } from '@unpic/react'
import { clsx } from 'clsx'

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
    className: clsx(
      'h-auto w-full transition-opacity duration-300 ease-(--ease-out)',
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

  return (
    <UnpicImage {...common} cdn="netlify" layout="constrained" sizes={sizes} />
  )
}
