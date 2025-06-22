export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  token?: string | null
) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new Error('Brakuje NEXT_PUBLIC_API_BASE_URL w .env.local');

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };

  // Dodaj Content-Type: application/json tylko, gdy NIE używasz FormData
  const isFormData = opts.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${base}${path}`, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (
    opts.method?.toUpperCase() === 'DELETE' ||
    response.status === 204 ||
    !contentType.includes('application/json')
  ) {
    return null;
  }

  return response.json();
}
