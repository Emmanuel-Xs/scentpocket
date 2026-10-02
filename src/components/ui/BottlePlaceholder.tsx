/** Shown where a product has no photo yet: the Pocket Bottle mark, quiet. */
export function BottlePlaceholder({ label }: { label: string }) {
  return (
    <svg
      viewBox="0 0 100 116"
      role="img"
      aria-label={label}
      className="h-2/5 w-auto text-ink/15"
      fill="none"
    >
      <rect x="37" y="2" width="26" height="14" rx="4" fill="currentColor" />
      <rect x="44" y="15" width="12" height="10" rx="1.5" fill="currentColor" />
      <path
        d="M14 31 Q14 25 20 25 H80 Q86 25 86 31 V70 Q86 78 81 85 L69 104 Q65 112 56 112 H44 Q35 112 31 104 L19 85 Q14 78 14 70 Z"
        fill="currentColor"
      />
    </svg>
  )
}
