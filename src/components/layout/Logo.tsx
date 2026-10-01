import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'

type Props = { tone?: 'ink' | 'cream'; className?: string }

/** The Pocket Bottle mark + wordmark. */
export function Logo({ tone = 'ink', className }: Props) {
  const fill = tone === 'ink' ? '#1C1915' : '#FAF6EF'
  const stitch = tone === 'ink' ? '#FAF6EF' : '#1C1915'
  const isInk = tone === 'ink'
  return (
    <Link
      to="/"
      aria-label="Scentpocket home"
      className={cn(
        'inline-flex items-center gap-2.5 no-underline',
        isInk ? 'text-ink' : 'text-cream',
        className,
      )}
    >
      <svg
        width={isInk ? 26 : 28}
        height={isInk ? 30 : 32}
        viewBox="0 0 100 116"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect x="37" y="2" width="26" height="14" rx="4" fill={fill} />
        <rect x="44" y="15" width="12" height="10" rx="1.5" fill={fill} />
        <path
          d="M14 31 Q14 25 20 25 H80 Q86 25 86 31 V70 Q86 78 81 85 L69 104 Q65 112 56 112 H44 Q35 112 31 104 L19 85 Q14 78 14 70 Z"
          fill={fill}
        />
        <path
          d="M23 35 H77 V69 Q77 75 73 80 L62 98 Q59 103 53 103 H47 Q41 103 38 98 L27 80 Q23 75 23 69 Z"
          stroke={stitch}
          strokeWidth="2.5"
          strokeDasharray="5 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          'font-serif leading-none tracking-[-0.01em]',
          isInk ? 'text-[28px]' : 'text-[30px]',
        )}
      >
        scentpocket
      </span>
    </Link>
  )
}
