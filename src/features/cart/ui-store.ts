import { create } from 'zustand'

type CartUiState = {
  open: boolean
  /** Why the cart changed on its own (sold out, quantity lowered). Shown at the top of the drawer. */
  notice: string | null
  setOpen: (open: boolean) => void
  setNotice: (notice: string | null) => void
}

export const useCartUi = create<CartUiState>((set) => ({
  open: false,
  notice: null,
  setOpen: (open) => set(open ? { open } : { open, notice: null }),
  setNotice: (notice) => set({ notice }),
}))
