import type {
  genderEnum,
  longevityEnum,
  occasionEnum,
  projectionEnum,
  scentFamilyEnum,
  tierEnum,
} from './schema'

type Tier = (typeof tierEnum.enumValues)[number]
type Gender = (typeof genderEnum.enumValues)[number]
type Family = (typeof scentFamilyEnum.enumValues)[number]
type Occasion = (typeof occasionEnum.enumValues)[number]
type Longevity = (typeof longevityEnum.enumValues)[number]
type Projection = (typeof projectionEnum.enumValues)[number]

export type SeedVariant = {
  label: string
  sizeMl: number
  priceKobo: number
  stock: number
}

export type SeedProduct = {
  slug: string
  name: string
  brand: string
  description: string
  tier: Tier
  gender: Gender
  family: Family
  occasions: Occasion[]
  top: string[]
  heart: string[]
  base: string[]
  longevity: Longevity
  projection: Projection
  /** Slug of the pricier scent this one resembles. */
  inspiredBy?: string
  featuredRank?: number
  variants: SeedVariant[]
  /** Bottle shot we download once, convert to WebP and upload. Credit: thescentsstore.com */
  imageSourceUrl?: string
}

/** Naira to integer kobo. */
const n = (naira: number) => naira * 100
const store = (handle: string) =>
  `https://www.thescentsstore.com/products/${handle}.json`

export const seedProducts: SeedProduct[] = [
  {
    slug: 'fragrance-world-explore',
    name: 'Explore Deodorant Spray',
    brand: 'Fragrance World',
    description:
      'Bright pineapple and blackcurrant over a clean musky base. A sharp, sunny spray for the daily commute that nods to Aventus at a tiny fraction of the price.',
    tier: 'pocket',
    gender: 'men',
    family: 'fresh',
    occasions: ['everyday'],
    top: ['Pineapple', 'Bergamot', 'Blackcurrant'],
    heart: ['Birch', 'Patchouli', 'Jasmine'],
    base: ['Musk', 'Oakmoss', 'Ambergris'],
    longevity: 'short',
    projection: 'soft',
    inspiredBy: 'creed-aventus',
    variants: [
      {
        label: '200ml Deodorant Spray',
        sizeMl: 200,
        priceKobo: n(3500),
        stock: 14,
      },
    ],
    imageSourceUrl: store(
      'fragrance-world-explore-deodorant-spray-for-men-200ml',
    ),
  },
  {
    slug: 'afnan-9pm-body-spray',
    name: '9PM Body Spray',
    brand: 'Afnan',
    description:
      'Sweet apple and cinnamon melting into vanilla and tonka. A warm, easy night-out scent that is loud enough to get compliments and soft enough for owambe.',
    tier: 'pocket',
    gender: 'men',
    family: 'amber',
    occasions: ['everyday', 'owambe'],
    top: ['Apple', 'Cinnamon', 'Lavender', 'Bitter orange'],
    heart: ['Orange blossom', 'Lily of the valley'],
    base: ['Vanilla', 'Tonka', 'Amber', 'Patchouli'],
    longevity: 'moderate',
    projection: 'moderate',
    featuredRank: 8,
    variants: [
      {
        label: '250ml Body Spray',
        sizeMl: 250,
        priceKobo: n(11500),
        stock: 12,
      },
    ],
    imageSourceUrl: store('afnan-9pm-deodorant-bodyspray-250ml'),
  },
  {
    slug: 'cdn-untold-body-spray',
    name: 'Club de Nuit Untold Body Spray',
    brand: 'Armaf',
    description:
      'Saffron, jasmine and amberwood in a spray you can afford to reapply. The cheeky answer to Baccarat Rouge 540: same glowing, sugary-woody trail, a hundredth of the price.',
    tier: 'pocket',
    gender: 'unisex',
    family: 'amber',
    occasions: ['everyday', 'date_night'],
    top: ['Saffron', 'Jasmine'],
    heart: ['Amberwood', 'Ambergris'],
    base: ['Fir resin', 'Cedar'],
    longevity: 'moderate',
    projection: 'moderate',
    inspiredBy: 'mfk-baccarat-rouge-540',
    featuredRank: 4,
    variants: [
      { label: '250ml Body Spray', sizeMl: 250, priceKobo: n(11500), stock: 9 },
    ],
    imageSourceUrl: store('armaf-club-de-nuit-untold-bodyspray-250ml'),
  },
  {
    slug: 'al-rehab-choco-musk',
    name: 'Choco Musk Roll On Oil',
    brand: 'Al Rehab',
    description:
      'A pocket-sized roll-on of chocolate, vanilla and soft musk. Dab it on pulse points for a skin-close, cosy sweetness that lasts surprisingly long.',
    tier: 'pocket',
    gender: 'unisex',
    family: 'gourmand',
    occasions: ['everyday'],
    top: ['Chocolate'],
    heart: ['Rose', 'Vanilla'],
    base: ['Musk', 'Sandalwood'],
    longevity: 'long',
    projection: 'soft',
    // Price is an estimate: confirm before launch. No image source yet (not stocked by the reference store).
    variants: [
      { label: '6ml Roll On Oil', sizeMl: 6, priceKobo: n(3000), stock: 15 },
    ],
  },
  {
    slug: 'lattafa-khamrah',
    name: 'Khamrah EDP',
    brand: 'Lattafa',
    description:
      'Cinnamon, dates and praline over vanilla and amberwood. Dessert-rich and dramatic, with all-day projection. The Arabian house hit everyone asks about.',
    tier: 'arabian_gems',
    gender: 'unisex',
    family: 'gourmand',
    occasions: ['owambe', 'date_night'],
    top: ['Cinnamon', 'Nutmeg', 'Bergamot'],
    heart: ['Dates', 'Praline', 'Tuberose', 'Mahonial'],
    base: ['Vanilla', 'Tonka', 'Benzoin', 'Myrrh', 'Amberwood', 'Akigalawood'],
    longevity: 'very_long',
    projection: 'strong',
    featuredRank: 2,
    variants: [
      { label: '100ml EDP', sizeMl: 100, priceKobo: n(42000), stock: 8 },
    ],
    imageSourceUrl: store('lattafa-khamrah-edp-100ml'),
  },
  {
    slug: 'lattafa-asad',
    name: 'Asad EDP',
    brand: 'Lattafa',
    description:
      'Black pepper and tobacco warmed by coffee, vanilla and dry wood. A confident, spicy signature for evenings that deserve a statement.',
    tier: 'arabian_gems',
    gender: 'men',
    family: 'amber',
    occasions: ['owambe', 'date_night'],
    top: ['Black pepper', 'Pineapple', 'Tobacco'],
    heart: ['Coffee', 'Patchouli', 'Iris'],
    base: ['Vanilla', 'Amber', 'Dry wood', 'Benzoin', 'Labdanum'],
    longevity: 'long',
    projection: 'strong',
    featuredRank: 7,
    variants: [
      { label: '100ml EDP', sizeMl: 100, priceKobo: n(30000), stock: 10 },
    ],
    imageSourceUrl: store('lattafa-asad-edp-100ml-men'),
  },
  {
    slug: 'lattafa-yara',
    name: 'Yara EDP',
    brand: 'Lattafa',
    description:
      'Powdery orchid and heliotrope wrapped in vanilla and musk. Soft, sweet and pretty, the kind of scent people lean in to ask about.',
    tier: 'arabian_gems',
    gender: 'women',
    family: 'gourmand',
    occasions: ['everyday', 'date_night'],
    top: ['Orchid', 'Heliotrope', 'Tangerine'],
    heart: ['Gourmand accord', 'Tropical fruits'],
    base: ['Vanilla', 'Musk', 'Sandalwood'],
    longevity: 'long',
    projection: 'moderate',
    variants: [
      { label: '100ml EDP', sizeMl: 100, priceKobo: n(28000), stock: 11 },
    ],
    imageSourceUrl: store('lattafa-yara-edp-100ml-unisex-perfume'),
  },
  {
    slug: 'cdn-intense-man',
    name: 'Club de Nuit Intense Man EDT',
    brand: 'Armaf',
    description:
      'Lemon, pineapple and smoky birch over musk and ambergris. The best-known Aventus-style fragrance on the market: crisp, powerful and made for the office and beyond.',
    tier: 'arabian_gems',
    gender: 'men',
    family: 'fresh',
    occasions: ['office', 'owambe'],
    top: ['Lemon', 'Pineapple', 'Bergamot', 'Blackcurrant', 'Apple'],
    heart: ['Birch', 'Jasmine', 'Rose'],
    base: ['Musk', 'Ambergris', 'Patchouli', 'Vanilla'],
    longevity: 'very_long',
    projection: 'strong',
    inspiredBy: 'creed-aventus',
    variants: [
      { label: '105ml EDT', sizeMl: 105, priceKobo: n(57000), stock: 7 },
    ],
    imageSourceUrl: store('armaf-club-de-nuit-intense-man-edt-105ml'),
  },
  {
    slug: 'dior-sauvage-edt',
    name: 'Sauvage EDT',
    brand: 'Dior',
    description:
      'Bergamot and pepper over a clean, ambery woody base. A modern classic that smells sharp, fresh and effortlessly confident.',
    tier: 'designer',
    gender: 'men',
    family: 'fresh',
    occasions: ['office', 'everyday'],
    top: ['Calabrian bergamot', 'Pepper'],
    heart: [
      'Sichuan pepper',
      'Lavender',
      'Pink pepper',
      'Vetiver',
      'Patchouli',
      'Geranium',
      'Elemi',
    ],
    base: ['Ambroxan', 'Cedar', 'Labdanum'],
    longevity: 'long',
    projection: 'strong',
    featuredRank: 3,
    variants: [
      { label: '60ml EDT', sizeMl: 60, priceKobo: n(150000), stock: 0 },
      { label: '100ml EDT', sizeMl: 100, priceKobo: n(240000), stock: 6 },
      { label: '200ml EDT', sizeMl: 200, priceKobo: n(404000), stock: 3 },
    ],
    imageSourceUrl: store('christian-dior-sauvage-edt-for-men'),
  },
  {
    slug: 'ch-good-girl',
    name: 'Good Girl EDP',
    brand: 'Carolina Herrera',
    description:
      'Tuberose and jasmine over cacao, tonka and almond in the iconic stiletto bottle. Bold, sweet and a little mischievous.',
    tier: 'designer',
    gender: 'women',
    family: 'amber',
    occasions: ['date_night', 'owambe'],
    top: ['Almond', 'Coffee', 'Bergamot', 'Lemon'],
    heart: ['Tuberose', 'Jasmine sambac', 'Orange blossom', 'Rose', 'Orris'],
    base: ['Tonka', 'Cacao', 'Vanilla', 'Praline', 'Sandalwood', 'Musk'],
    longevity: 'long',
    projection: 'moderate',
    variants: [
      { label: '30ml EDP', sizeMl: 30, priceKobo: n(79000), stock: 0 },
      { label: '50ml EDP', sizeMl: 50, priceKobo: n(140000), stock: 0 },
      { label: '80ml EDP', sizeMl: 80, priceKobo: n(195000), stock: 5 },
    ],
    imageSourceUrl: store('carolina-herrera-good-girl-edp-perfume-for-women'),
  },
  {
    slug: 'ysl-libre',
    name: 'Libre EDP',
    brand: 'Yves Saint Laurent',
    description:
      'Lavender and orange blossom with a vanilla-musk drydown. Fresh and feminine with a rebellious edge, equally at home at work or dinner.',
    tier: 'designer',
    gender: 'women',
    family: 'floral',
    occasions: ['office', 'date_night'],
    top: ['Lavender', 'Mandarin', 'Blackcurrant', 'Petitgrain'],
    heart: ['Lavender', 'Orange blossom', 'Jasmine'],
    base: ['Vanilla', 'Musk', 'Cedar', 'Ambergris'],
    longevity: 'long',
    projection: 'moderate',
    featuredRank: 5,
    variants: [
      { label: '90ml EDP', sizeMl: 90, priceKobo: n(189000), stock: 4 },
    ],
    imageSourceUrl: store(
      'yves-saint-laurent-libre-edp-90ml-perfume-for-women',
    ),
  },
  {
    slug: 'jpg-le-male-elixir',
    name: 'Le Male Elixir',
    brand: 'Jean Paul Gaultier',
    description:
      'Lavender and mint over a thick honey, tonka and tobacco base. A syrupy, seductive powerhouse for cold nights and big entrances.',
    tier: 'designer',
    gender: 'men',
    family: 'amber',
    occasions: ['date_night', 'owambe'],
    top: ['Lavender', 'Mint'],
    heart: ['Vanilla', 'Benzoin'],
    base: ['Honey', 'Tonka', 'Tobacco'],
    longevity: 'very_long',
    projection: 'strong',
    variants: [
      { label: '125ml EDP', sizeMl: 125, priceKobo: n(260000), stock: 5 },
    ],
    imageSourceUrl: store('jean-paul-gaultier-le-male-elixir-edp-125ml'),
  },
  {
    slug: 'creed-aventus',
    name: 'Aventus EDP',
    brand: 'Creed',
    description:
      'Pineapple, birch and ambergris: the fragrance that launched a thousand dupes. Smoky, fruity and polished, the original power scent.',
    tier: 'niche',
    gender: 'men',
    family: 'woody',
    occasions: ['office', 'owambe'],
    top: ['Pineapple', 'Bergamot', 'Blackcurrant', 'Apple'],
    heart: ['Birch', 'Patchouli', 'Jasmine', 'Rose'],
    base: ['Musk', 'Oakmoss', 'Ambergris', 'Vanilla'],
    longevity: 'long',
    projection: 'moderate',
    variants: [
      { label: '100ml EDP', sizeMl: 100, priceKobo: n(601000), stock: 0 },
    ],
    imageSourceUrl: store('creed-aventus-edp-100ml-for-men'),
  },
  {
    slug: 'mfk-baccarat-rouge-540',
    name: 'Baccarat Rouge 540',
    brand: 'Maison Francis Kurkdjian',
    description:
      'Saffron, jasmine and amberwood with a sugary, mineral glow. Airy yet unmistakable, the trail everyone follows across the room.',
    tier: 'niche',
    gender: 'unisex',
    family: 'amber',
    occasions: ['owambe', 'date_night'],
    top: ['Saffron', 'Jasmine'],
    heart: ['Amberwood', 'Ambergris'],
    base: ['Fir resin', 'Cedar'],
    longevity: 'very_long',
    projection: 'strong',
    featuredRank: 1,
    variants: [
      { label: '70ml EDP', sizeMl: 70, priceKobo: n(680000), stock: 1 },
      { label: '200ml EDP', sizeMl: 200, priceKobo: n(1000000), stock: 2 },
    ],
    imageSourceUrl: store(
      'maison-francis-kurkdjian-baccarat-rouge-540-unisex-perfume-edp-70ml',
    ),
  },
  {
    slug: 'tom-ford-oud-wood',
    name: 'Oud Wood EDP',
    brand: 'Tom Ford',
    description:
      'Rare oud and rosewood softened by sandalwood, vanilla and amber. Quiet, smooth and luxurious, a polished oud for people who dislike shouting.',
    tier: 'niche',
    gender: 'unisex',
    family: 'woody',
    occasions: ['office', 'date_night'],
    top: ['Rosewood', 'Cardamom', 'Chinese pepper'],
    heart: ['Oud', 'Sandalwood', 'Vetiver'],
    base: ['Tonka', 'Vanilla', 'Amber'],
    longevity: 'moderate',
    projection: 'soft',
    variants: [
      { label: '50ml EDP', sizeMl: 50, priceKobo: n(360000), stock: 4 },
      { label: '100ml EDP', sizeMl: 100, priceKobo: n(520000), stock: 3 },
      { label: '250ml EDP', sizeMl: 250, priceKobo: n(820000), stock: 0 },
    ],
    imageSourceUrl: store('tom-ford-oud-wood-unisex-edp-perfume'),
  },
  {
    slug: 'pdm-layton',
    name: 'Layton EDP',
    brand: 'Parfums de Marly',
    description:
      'Apple, lavender and vanilla over cardamom, sandalwood and pepper. Warm, spicy and effortlessly stylish, a crowd-pleaser with serious presence.',
    tier: 'niche',
    gender: 'unisex',
    family: 'amber',
    occasions: ['date_night', 'office'],
    top: ['Apple', 'Lavender', 'Bergamot', 'Mandarin'],
    heart: ['Geranium', 'Violet', 'Jasmine'],
    base: [
      'Vanilla',
      'Cardamom',
      'Sandalwood',
      'Pepper',
      'Patchouli',
      'Guaiac',
    ],
    longevity: 'long',
    projection: 'strong',
    featuredRank: 6,
    variants: [
      { label: '125ml EDP', sizeMl: 125, priceKobo: n(380000), stock: 6 },
    ],
    imageSourceUrl: store('parfums-de-marly-layton-edp-125ml-unisex-perfume'),
  },
]
