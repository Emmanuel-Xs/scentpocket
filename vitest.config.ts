import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '#': new URL('./src', import.meta.url).pathname } },
  test: { environment: 'node', testTimeout: 30_000, hookTimeout: 30_000 },
})
