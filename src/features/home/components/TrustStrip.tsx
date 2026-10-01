import { BadgeCheck, Banknote, Gift, Truck } from 'lucide-react'

const items = [
  {
    Icon: BadgeCheck,
    title: '100% authentic',
    body: 'Every bottle comes from authorised distributors.',
  },
  {
    Icon: Truck,
    title: 'Lagos in 1 to 2 days',
    body: 'Mainland ₦3,000, Island ₦4,500, rest of Nigeria ₦7,000.',
  },
  {
    Icon: Gift,
    title: 'Free delivery over ₦300k',
    body: 'Treat yourself or someone special. The ride is on us.',
  },
  {
    Icon: Banknote,
    title: 'Pay on delivery',
    body: 'Cash or transfer when your scent arrives.',
  },
]

export function TrustStrip() {
  return (
    <section className="page-container pb-16">
      <hr className="border-0 border-t-2 border-dashed border-border" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-7 pt-10">
        {items.map(({ Icon, title, body }) => (
          <div key={title} className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blush">
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold">{title}</span>
              <span className="text-sm leading-normal text-text-2">{body}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
