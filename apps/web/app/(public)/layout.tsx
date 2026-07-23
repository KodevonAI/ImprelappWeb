import { PublicLayout } from '@/components/public/public-layout'
import { CartProvider } from '@/lib/cart-context'

export default function PublicRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PublicLayout>{children}</PublicLayout>
    </CartProvider>
  )
}
