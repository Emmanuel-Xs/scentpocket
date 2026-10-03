import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Image } from '#/features/images/Image'
import { cn } from '#/lib/utils'
import { useDebouncedCallback } from '#/lib/use-debounced-callback'
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '../schemas'
import {
  deleteProductPhoto,
  makeMainPhoto,
  uploadProductPhoto,
} from '../server/products'
import type { AdminProductPhoto } from '../types'

/** Upload, remove and reorder the photos of a saved product. Files become WebP on the server. */
export function PhotoManager({
  productId,
  photos,
}: {
  productId: string
  photos: AdminProductPhoto[]
}) {
  const queryClient = useQueryClient()
  const upload = useServerFn(uploadProductPhoto)
  const remove = useServerFn(deleteProductPhoto)
  const makeMain = useServerFn(makeMainPhoto)
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  // What the grid shows right now. It leads the server list until the save lands and the data refetches.
  const [local, setLocal] = useState<AdminProductPhoto[] | null>(null)
  const shown = local ?? photos
  useEffect(() => setLocal(null), [photos])

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin'] }),
      queryClient.invalidateQueries({ queryKey: ['catalog'] }),
    ])

  const send = async (files: FileList | File[]) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
          toast.error(`${file.name}: use a PNG, JPEG or WebP image.`)
          continue
        }
        if (file.size > MAX_IMAGE_BYTES) {
          toast.error(`${file.name} is over 8 MB.`)
          continue
        }
        const body = new FormData()
        body.set('productId', productId)
        body.set('file', file)
        const res = await upload({ data: body })
        if (res.ok) toast.success(`${file.name} added`)
        else toast.error(res.error)
      }
      await refresh()
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (input.current) input.current.value = ''
    }
  }

  const undo = () => {
    setLocal(null)
    toast.error('Could not do that. It is back to how it was.')
  }

  const saveMain = useDebouncedCallback(async (id: string) => {
    try {
      const res = await makeMain({ data: { id } })
      if (!res.ok) return undo()
      await refresh()
      toast.success('Main photo changed')
    } catch {
      undo()
    }
  }, 400)

  // Optimistic and debounced: the photo jumps to the front at once, one save follows the last click.
  const pickMain = (id: string) => {
    const picked = shown.find((p) => p.id === id)
    if (!picked) return
    setLocal([picked, ...shown.filter((p) => p.id !== id)])
    saveMain(id)
  }

  // Optimistic only: a delete is a single deliberate action, so there is nothing to debounce.
  const removePhoto = async (id: string) => {
    setLocal(shown.filter((p) => p.id !== id))
    try {
      const res = await remove({ data: { id } })
      if (!res.ok) return undo()
      await refresh()
      toast.success('Photo deleted')
    } catch {
      undo()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {shown.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(130px,100%),1fr))] gap-3 p-0">
          {shown.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-2">
              <div className="relative grid aspect-4/5 place-items-center overflow-hidden rounded-lg bg-blush">
                <Image
                  src={p.url}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes="130px"
                  className="mix-blend-multiply"
                />
                {i === 0 ? (
                  <span className="absolute top-2 left-2 rounded-pill bg-ink px-2 py-0.5 text-[11px] font-semibold text-cream">
                    Main
                  </span>
                ) : null}
              </div>
              <div className="flex gap-1.5">
                {i > 0 ? (
                  <button
                    type="button"
                    onClick={() => pickMain(p.id)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-pill border border-border text-xs font-semibold transition-transform duration-150 active:scale-[0.97]"
                  >
                    <Star size={14} strokeWidth={1.5} aria-hidden="true" /> Main
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Delete photo"
                  onClick={() => void removePhoto(p.id)}
                  className="grid size-10 place-items-center rounded-pill border border-border text-danger transition-transform duration-150 active:scale-[0.97]"
                >
                  <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-2">
          No photos yet. The shop shows a blank tile until you add one.
        </p>
      )}

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void send(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink',
          dragging
            ? 'border-ink bg-blush'
            : 'border-border-strong hover:border-ink',
          uploading && 'cursor-progress opacity-70',
        )}
      >
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          disabled={uploading}
          className="sr-only"
          onChange={(e) => e.target.files && void send(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2
              size={24}
              strokeWidth={1.5}
              className="animate-spin"
              aria-hidden="true"
            />
            <span className="font-semibold">Processing…</span>
          </>
        ) : (
          <>
            <ImagePlus size={24} strokeWidth={1.5} aria-hidden="true" />
            <span className="font-semibold">
              Drop photos here or click to choose
            </span>
            <span className="text-[13px] text-muted">
              PNG, JPEG or WebP, up to 8 MB. Saved as small WebP files.
            </span>
          </>
        )}
      </label>
    </div>
  )
}
