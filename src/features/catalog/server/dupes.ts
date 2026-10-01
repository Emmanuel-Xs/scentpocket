import { createServerFn } from '@tanstack/react-start'
import type { DupePair } from '../types'
import { buildDupePairs, loadActiveCards } from './cards'

export const getDupePairs = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DupePair[]> => buildDupePairs(await loadActiveCards()),
)
