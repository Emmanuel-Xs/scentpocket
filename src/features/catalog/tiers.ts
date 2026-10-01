import type { Tier } from './types'

type TierStyle = {
  label: string
  range: string
  blurb: string
  /** Solid tier colour (cards, banners). */
  bg: string
  /** Pale tint behind product photos. */
  tint: string
  /** Small chip on a card. */
  chip: string
  /** Hex for the dashed price tag border. */
  hex: string
}

// Full class names so Tailwind can see them.
export const tierStyles: Record<Tier, TierStyle> = {
  pocket: {
    label: 'Pocket',
    range: 'Under ₦15k',
    blurb: 'Body sprays, oils and roll ons. Smell good on a student budget.',
    bg: 'bg-pocket',
    tint: 'bg-pocket/8',
    chip: 'bg-pocket text-white',
    hex: '#B4532F',
  },
  arabian_gems: {
    label: 'Arabian Gems',
    range: '₦25k to ₦70k',
    blurb: 'Lattafa, Armaf and the long lasting Lagos favourites.',
    bg: 'bg-arabian',
    tint: 'bg-arabian/8',
    chip: 'bg-arabian text-white',
    hex: '#9A6510',
  },
  designer: {
    label: 'Designer',
    range: '₦75k to ₦400k',
    blurb: 'Dior, YSL, Carolina Herrera. The names everyone knows.',
    bg: 'bg-designer',
    tint: 'bg-designer/8',
    chip: 'bg-designer text-white',
    hex: '#1F2F52',
  },
  niche: {
    label: 'Niche',
    range: '₦350k and up',
    blurb: 'Creed, Kurkdjian, Tom Ford. For the boardroom and the big gift.',
    bg: 'bg-niche',
    tint: 'bg-niche/8',
    chip: 'bg-niche text-gold',
    hex: '#1C1915',
  },
}
