import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

// The Netlify plugin starts a Deno edge-functions server in dev that crashes here; it is only needed to build.
const config = defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    ...(command === 'build' ? [netlify()] : []),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config
