import { create } from 'zustand'

type SearchState = {
  open: boolean
  /** Opened with the keyboard: skip the entrance animation. */
  viaKeyboard: boolean
  show: (viaKeyboard?: boolean) => void
  hide: () => void
  setOpen: (open: boolean) => void
}

export const useSearchStore = create<SearchState>((set) => ({
  open: false,
  viaKeyboard: false,
  show: (viaKeyboard = false) => set({ open: true, viaKeyboard }),
  hide: () => set({ open: false }),
  setOpen: (open) => set({ open }),
}))
