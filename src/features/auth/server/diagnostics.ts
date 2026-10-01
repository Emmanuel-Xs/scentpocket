import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

/** Temporary: records where a stray OAuth code arrived from, so we can find the cause. No secrets logged. */
export const logStrayCode = createServerFn({ method: 'GET' }).handler(
  async () => {
    const req = getRequest()
    console.log(
      '[auth] stray code on home page',
      JSON.stringify({
        url: req.url.replace(/code=[^&]+/, 'code=…'),
        referer: req.headers.get('referer'),
        secFetchSite: req.headers.get('sec-fetch-site'),
        secFetchMode: req.headers.get('sec-fetch-mode'),
        hasSessionCookie: (req.headers.get('cookie') ?? '').includes(
          '-auth-token',
        ),
      }),
    )
    return null
  },
)
