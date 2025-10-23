import { NextRouter } from 'next/router'

export const updateQueryParameters = (
  router: NextRouter,
  key: string,
  value: string | number | boolean | null | undefined
) => {
  const params = new URLSearchParams(window.location.search)

  if (value === undefined || value === null) {
    params.delete(key)
  } else {
    params.set(key, String(value))
  }

  router.push(`${window.location.pathname}?${params.toString()}`, undefined, {
    shallow: true
  })
}
