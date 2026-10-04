import { create } from 'zustand'

type CartUiState = {
  open: boolean
  /** Why the cart changed on its own (sold out, quantity lowered). Shown at the top of the drawer. */
  notice: string | null
  /** True while the sign in merge is running; cart controls are disabled so no edit is lost. */
  merging: boolean
  setOpen: (open: boolean) => void
  setNotice: (notice: string | null) => void
  setMerging: (merging: boolean) => void
}

export const useCartUi = create<CartUiState>((set) => ({
  open: false,
  notice: null,
  merging: false,
  setOpen: (open) => set(open ? { open } : { open, notice: null }),
  setNotice: (notice) => set({ notice }),
  setMerging: (merging) => set({ merging }),
}))
