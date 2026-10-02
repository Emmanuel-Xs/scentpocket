import { useState } from 'react'
import { TierChip } from '#/features/catalog/components/TierChip'
import { tierStyles } from '#/features/catalog/tiers'
import type { ProductDetail } from '#/features/catalog/types'
import { BottlePlaceholder } from '#/components/ui/BottlePlaceholder'
import { Image } from '#/features/images/Image'
import { cn } from '#/lib/utils'

export function Gallery({ product }: { product: ProductDetail }) {
  const [index, setIndex] = useState(0)
  const { images, card } = product
  const current = images.at(index)
  const tint = tierStyles[card.tier].tint

  return (
    <div className="flex flex-col gap-3.5">
      <div
        className={cn(
          'relative grid aspect-4/5 place-items-center overflow-hidden rounded-3xl',
          tint,
        )}
      >
        {current ? (
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            blurDataUrl={current.blurDataUrl}
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="mix-blend-multiply"
          />
        ) : (
          <BottlePlaceholder label={`${card.brand} ${card.name}`} />
        )}
        <span className="absolute top-4.5 left-4.5">
          <TierChip tier={card.tier} />
        </span>
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'grid h-22 w-18 shrink-0 place-items-center overflow-hidden rounded-[14px] p-0 transition-transform duration-150 active:scale-[0.97]',
                tint,
                i === index ? 'border-2 border-ink' : 'border border-border',
              )}
            >
              <Image
                src={img.src}
                alt=""
                width={img.width}
                height={img.height}
                sizes="72px"
                className="mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
