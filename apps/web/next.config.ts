function parseApiOrigin(url: string): { protocol: 'http' | 'https'; hostname: string; port: string } {
  try {
    const u = new URL(url)
    return {
      protocol: u.protocol === 'https:' ? 'https' : 'http',
      hostname: u.hostname,
      port: u.port,
    }
  } catch {
    return { protocol: 'http', hostname: 'localhost', port: '3001' }
  }
}

const { protocol, hostname, port } = parseApiOrigin(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
)

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol, hostname, port, pathname: '/uploads/**' },
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
