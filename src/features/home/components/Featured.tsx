import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '#/features/catalog/components/ProductCard'
import type { ProductCardData } from '#/features/catalog/types'

export function Featured({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null
  return (
    <section className="page-container flex flex-col gap-7 pt-16 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-(length:--text-h2)">Lagos is wearing</h2>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 font-semibold underline decoration-1 underline-offset-4"
        >
          Shop all <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
