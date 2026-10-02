# Scentpocket: Catalog seed data and research

Prices from The Scents Store (Lagos), checked 1 Oct 2026. Notes are top / heart / base as commonly listed on Fragrantica and retailer pages. Longevity and projection are community consensus, approximate. Items marked (est.) need a second check.

## Catalog (15 products)

### Pocket (under ₦15k)

| Product | Gender | Family | Sizes and prices | Notes (top / heart / base) | Longevity / projection | Dupe of |
|---|---|---|---|---|---|---|
| Fragrance World Explore Deodorant Spray | Men | Fresh fruity | 200ml ₦3,500 | Pineapple, bergamot, blackcurrant / birch, patchouli, jasmine / musk, oakmoss, ambergris (est.) | Short / soft | Creed Aventus |
| Afnan 9PM Body Spray | Men | Amber sweet | 250ml ₦11,500 | Apple, cinnamon, lavender, bitter orange / orange blossom, lily of the valley / vanilla, tonka, amber, patchouli | Moderate / moderate | JPG Ultra Male |
| Armaf Club de Nuit Untold Body Spray | Unisex | Amber floral | 250ml ₦11,500 | Saffron, jasmine / amberwood, ambergris / fir resin, cedar | Moderate / moderate | MFK Baccarat Rouge 540 |

### Arabian Gems (₦25k to ₦70k)

| Product | Gender | Family | Sizes and prices | Notes | Longevity / projection | Dupe of |
|---|---|---|---|---|---|---|
| Lattafa Khamrah EDP | Unisex | Amber spicy gourmand | 100ml ₦42,000 | Cinnamon, nutmeg, bergamot / dates, praline, tuberose, mahonial / vanilla, tonka, benzoin, myrrh, amberwood, akigalawood | Very long / strong | Kilian Angels' Share |
| Lattafa Asad EDP | Men | Amber spicy | 100ml ₦30,000 | Black pepper, pineapple, tobacco / coffee, patchouli, iris / vanilla, amber, dry wood, benzoin, labdanum | Long / strong | Dior Sauvage Elixir |
| Lattafa Yara EDP | Women | Gourmand floral | 100ml ₦28,000 | Orchid, heliotrope, tangerine / gourmand accord, tropical fruits / vanilla, musk, sandalwood | Long / moderate | none |
| Armaf Club de Nuit Intense Man EDT | Men | Fresh woody | 105ml ₦57,000 | Lemon, pineapple, bergamot, blackcurrant, apple / birch, jasmine, rose / musk, ambergris, patchouli, vanilla | Very long / strong | Creed Aventus |

### Designer (₦75k to ₦400k)

| Product | Gender | Family | Sizes and prices | Notes | Longevity / projection |
|---|---|---|---|---|---|
| Dior Sauvage EDT | Men | Fresh spicy | 60ml ₦150,000 (sold out), 100ml ₦240,000, 200ml ₦404,000 | Calabrian bergamot, pepper / Sichuan pepper, lavender, pink pepper, vetiver, patchouli, geranium, elemi / ambroxan, cedar, labdanum | Long / strong |
| Carolina Herrera Good Girl EDP | Women | Amber floral | 30ml ₦79,000 (sold out), 50ml ₦140,000 (sold out), 80ml ₦195,000 | Almond, coffee, bergamot, lemon / tuberose, jasmine sambac, orange blossom, rose, orris / tonka, cacao, vanilla, praline, sandalwood, musk | Long / moderate |
| YSL Libre EDP | Women | Floral lavender | 90ml ₦189,000 | Lavender, mandarin, blackcurrant, petitgrain / lavender, orange blossom, jasmine / vanilla, musk, cedar, ambergris | Long / moderate |
| JPG Le Male Elixir | Men | Amber fougere | 125ml ₦260,000 | Lavender, mint / vanilla, benzoin / honey, tonka, tobacco | Very long / strong |

### Niche (₦350k and up)

| Product | Gender | Family | Sizes and prices | Notes | Longevity / projection |
|---|---|---|---|---|---|
| Creed Aventus EDP | Men | Fruity chypre | 100ml ₦601,000 (sold out) | Pineapple, bergamot, blackcurrant, apple / birch, patchouli, jasmine, rose / musk, oakmoss, ambergris, vanilla | Long / moderate |
| MFK Baccarat Rouge 540 | Unisex | Amber floral | EDP 70ml ₦680,000, EDP 200ml ₦1,000,000 | Saffron, jasmine / amberwood, ambergris / fir resin, cedar | Very long / strong |
| Tom Ford Oud Wood EDP | Unisex | Woody oud | 50ml ₦360,000, 100ml ₦520,000, 250ml ₦820,000 (sold out) | Rosewood, cardamom, Chinese pepper / oud, sandalwood, vetiver / tonka, vanilla, amber | Moderate / soft |
| Parfums de Marly Layton | Unisex | Amber fougere | 125ml ₦380,000 | Apple, lavender, bergamot, mandarin / geranium, violet, jasmine / vanilla, cardamom, sandalwood, pepper, patchouli, guaiac | Long / strong |

Sold out variants are real stock states at the source, which makes them good demo data for disabled size buttons.

## Occasions, slugs and dupe links (for `seed-data.ts`)

| Slug | Occasions | inspiredBy (slug) |
|---|---|---|
| `fragrance-world-explore` | everyday | `creed-aventus` |
| `afnan-9pm-body-spray` | everyday, owambe | none in catalog (Ultra Male not stocked) |
| `cdn-untold-body-spray` | everyday, date_night | `mfk-baccarat-rouge-540` |
| `lattafa-khamrah` | owambe, date_night | none in catalog |
| `lattafa-asad` | owambe, date_night | none in catalog |
| `lattafa-yara` | everyday, date_night | none |
| `cdn-intense-man` | office, owambe | `creed-aventus` |
| `dior-sauvage-edt` | office, everyday | none |
| `ch-good-girl` | date_night, owambe | none |
| `ysl-libre` | office, date_night | none |
| `jpg-le-male-elixir` | date_night, owambe | none |
| `creed-aventus` | office, owambe | none |
| `mfk-baccarat-rouge-540` | owambe, date_night | none |
| `tom-ford-oud-wood` | office, date_night | none |
| `pdm-layton` | date_night, office | none |

Stock for seeding: use the sold out states above as `0`; give everything else 3 to 15 units, and give BR540 70ml exactly `1` so the last bottle race is easy to demo.

Images: one bottle shot per product, downloaded once, processed by the seed script (WebP + blur) and stored in Supabase Storage. Keep the source URL for each in `seed-data.ts` as `imageSourceUrl` for credit and reprocessing.

## UX findings and recommendations

1. **Size picker as buttons, not a dropdown.** Baymard: dropdown size pickers get overlooked and hide stock; 71% of leading sites use buttons. Show sold out sizes as visible but disabled (struck through), with price per ml under each.
2. **"You can't smell through a screen."** Fragrance buyers research over many visits and read notes heavily. So: notes pyramid, scent family, longevity/projection meters, and evocative copy (what it smells like, when to wear it), not just ingredient lists.
3. **Shop by scent family** (Fresh, Woody, Amber, Floral, Gourmand) is a standard perfume filter alongside gender and occasion.
4. **Dupes across tiers** ("Love Baccarat Rouge 540? Try Club de Nuit Untold for ₦11,500"). This is the strongest expression of "a scent for every pocket" and uses data we already have.
5. **Cart drawer with a free delivery progress bar** ("₦48,000 away from free delivery").
6. **Single page checkout**: sign in gate first, Google email prefilled, zone select updates the fee live, order summary always visible.
7. **Trust strip**: "100% authentic", delivery times per zone, demo banner.
8. Skipped for time: scent quiz, samples/discovery sets, reviews, gift wrap.

## Sources

- The Scents Store search pages (Lattafa, Asad, Armaf Club de Nuit, body mist, Dior Sauvage, Good Girl, YSL Libre, JPG Le Male, Baccarat Rouge, Tom Ford Oud Wood, Parfums de Marly), thescentsstore.com
- Baymard Institute, Use buttons for size selection: https://baymard.com/blog/use-buttons-for-size-selection
- Peasy, Fragrance e-commerce: the consideration phase challenge: https://www.peasy.nu/blog/fragrance-e-commerce-analytics-the-consideration-phase-challenge
- CartCoders, How to build a perfume ecommerce store: https://cartcoders.com/blog/ecommerce/how-to-build-perfume-ecommerce-store-that-appeals-to-senses/
- Osme fragrance UX case study: https://medium.com/@agildesign/redefining-the-e-commerce-strategy-for-a-local-fragrance-business-ux-case-study-bc7df26d215c
