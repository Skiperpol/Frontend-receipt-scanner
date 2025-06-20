// lib/api.ts
export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  token?: string | null
) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) throw new Error('Brakuje NEXT_PUBLIC_API_BASE_URL w .env.local')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  }

  const res = await fetch(`${base}${path}`, {
    ...opts,
    headers,
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
