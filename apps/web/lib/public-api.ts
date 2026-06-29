const API_URL = process.env.API_URL ?? 'http://localhost:3001'

export async function publicGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}
