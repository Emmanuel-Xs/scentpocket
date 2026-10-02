import type { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { AppShell } from '#/components/layout/AppShell'
import { userQueryOptions } from '#/features/auth/queries'
import serifItalic from '@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2?url'
import serif from '@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2?url'
import sans from '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2?url'
import appCss from '../styles/app.css?url'

// Preloaded so the headline does not reflow when the web fonts arrive (CLS).
const fontPreloads = [serif, serifItalic, sans].map((href) => ({
  rel: 'preload',
  href,
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous' as const,
}))

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async ({ context }) => ({
      user: await context.queryClient.ensureQueryData(userQueryOptions()),
    }),
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content',
        },
        {
          name: 'theme-color',
          content: '#FAF6EF',
        },
        {
          title: 'Scentpocket · A scent for every pocket',
        },
      ],
      links: [
        ...fontPreloads,
        { rel: 'stylesheet', href: appCss },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        {
          rel: 'icon',
          href: '/favicon-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          rel: 'icon',
          href: '/favicon-16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    }),
    shellComponent: RootDocument,
  },
)

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AppShell>{children}</AppShell>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
