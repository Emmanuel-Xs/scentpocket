/** No 0/O, 1/I or L: refs get read aloud and typed from emails. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const LENGTH = 6

/** `SP-24F7K2`. Uses crypto randomness; the database unique index is the final guard against clashes. */
export function generateOrderRef(): string {
  const bytes = new Uint8Array(LENGTH)
  crypto.getRandomValues(bytes)
  let ref = ''
  for (const b of bytes) ref += ALPHABET.charAt(b % ALPHABET.length)
  return `SP-${ref}`
}

export const ORDER_REF_PATTERN = /^SP-[23456789A-HJKMNP-Z]{6}$/
