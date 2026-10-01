import { Link } from '@tanstack/react-router'
import { tierLabels, tiers } from '#/features/catalog/schemas'
import { Logo } from './Logo'

const link = 'no-underline hover:underline hover:underline-offset-4'
const heading = 'font-semibold text-gold'

export function SiteFooter() {
  return (
    <footer className="bg-ink text-cream [&_a]:text-cream">
      <div className="page-container flex flex-col gap-10 pt-14 pb-8">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-80 flex-col gap-3.5">
            <Logo tone="cream" />
            <p className="text-sm leading-relaxed text-[#CFC6B8]">
              A Lagos fragrance shop where a ₦3,500 body spray and a Baccarat
              Rouge share the same shelf.
            </p>
          </div>
          <div className="flex flex-wrap gap-14 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className={heading}>Shop</span>
              {tiers.map((tier) => (
                <Link key={tier} to="/shop" search={{ tier }} className={link}>
                  {tierLabels[tier]}
                </Link>
              ))}
              <Link to="/dupes" className={link}>
                Dupes
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className={heading}>Help</span>
              <Link to="/terms" className={link}>
                Delivery
              </Link>
              <Link to="/terms" className={link}>
                Returns
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className={heading}>Legal</span>
              <Link to="/privacy" className={link}>
                Privacy
              </Link>
              <Link to="/terms" className={link}>
                Terms
              </Link>
            </div>
          </div>
        </div>
        <hr className="border-0 border-t-2 border-dashed border-cream/25" />
        <p className="text-[13px] text-[#CFC6B8]">
          © 2026 Scentpocket. A demo store for HNG Internship. Nothing here is
          for sale.
        </p>
      </div>
    </footer>
  )
}
