import type { ComponentProps } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '#/lib/utils'

/** Thin shadcn-style wrapper over Vaul. Direction: `bottom` on phones, `right` on desktop. */
export const Drawer = DrawerPrimitive.Root
export const DrawerTrigger = DrawerPrimitive.Trigger
export const DrawerClose = DrawerPrimitive.Close
export const DrawerTitle = DrawerPrimitive.Title
export const DrawerDescription = DrawerPrimitive.Description

export function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-(--z-drawer) bg-overlay" />
      <DrawerPrimitive.Content
        className={cn(
          'fixed z-(--z-drawer) flex flex-col bg-cream shadow-lg outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  )
}
