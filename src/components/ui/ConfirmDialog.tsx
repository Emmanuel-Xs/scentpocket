import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Red confirm button for destructive actions. */
  danger?: boolean
  pending?: boolean
  onConfirm: () => void
}

/** Centre dialog (scales from centre). Esc and the backdrop cancel; focus is trapped by Radix. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep it',
  danger,
  pending,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-59 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-(--z-dialog) flex w-[min(460px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 animate-pop flex-col gap-4 rounded-3xl bg-surface p-6 shadow-lg outline-none">
          <Dialog.Title className="font-serif text-[28px] leading-none">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-[15px] leading-relaxed text-text-2">
            {description}
          </Dialog.Description>
          <div className="flex flex-wrap justify-end gap-2.5 pt-2">
            <Dialog.Close className="min-h-12 rounded-pill border border-ink px-5 text-[15px] font-semibold transition-transform duration-150 active:scale-[0.97]">
              {cancelLabel}
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={`min-h-12 rounded-pill border px-5 text-[15px] font-semibold text-white transition-transform duration-150 active:scale-[0.97] disabled:cursor-progress disabled:active:scale-100 ${danger ? 'border-danger bg-danger' : 'border-ink bg-ink'}`}
            >
              {pending ? 'Working…' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
