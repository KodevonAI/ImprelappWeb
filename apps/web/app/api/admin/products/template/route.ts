import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'

export async function GET() {
  const store = await cookies()
  const token = store.get('admin_token')?.value

  const res = await fetch(`${API_URL}/api/products/template`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const csv = await res.text()

  return new NextResponse(csv, {
    status: res.status,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="template-productos.csv"',
    },
  })
}
