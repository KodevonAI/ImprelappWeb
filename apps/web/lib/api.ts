const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type RequestInit = globalThis.RequestInit

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

export function apiGet<T>(path: string, options?: RequestInit) {
  return apiFetch<T>(path, options)
}

export function apiPost<T>(path: string, body: unknown, options?: RequestInit) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  })
}

export function apiPut<T>(path: string, body: unknown, options?: RequestInit) {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  })
}

export function apiPatch<T>(path: string, body: unknown, options?: RequestInit) {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    ...options,
  })
}

export function apiDelete(path: string, options?: RequestInit) {
  return apiFetch(path, { method: 'DELETE', ...options })
}

export function authHeader(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } }
}
