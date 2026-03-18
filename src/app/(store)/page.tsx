import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wrench, Shield, Truck, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true } },
      },
      take: 8,
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { active: true },
      include: { _count: { select: { products: true } } },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#162F56] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <Badge variant="orange" className="mb-4 text-sm px-3 py-1">
              Ferretería Industrial #1
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Todo lo que necesitas para tu
              <span className="text-[#F97316]"> industria</span>
            </h1>
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              Rodamientos, piñones, correas y ferretería de alta calidad.
              Entrega rápida y asesoría técnica especializada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="orange" size="lg" asChild>
                <Link href="/productos">
                  Ver catálogo completo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-[#1B3A6B]"
                asChild
              >
                <Link href="/#nosotros">Conócenos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-10 bg-[#F97316]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 flex-shrink-0" />
              <div>
                <p className="font-semibold">Envío a todo Colombia</p>
                <p className="text-sm opacity-90">Entrega rápida y segura</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 flex-shrink-0" />
              <div>
                <p className="font-semibold">Calidad garantizada</p>
                <p className="text-sm opacity-90">Productos certificados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8 flex-shrink-0" />
              <div>
                <p className="font-semibold">Asesoría técnica</p>
                <p className="text-sm opacity-90">Expertos a tu disposición</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-3">
              Nuestras categorías
            </h2>
            <p className="text-gray-600">Encuentra exactamente lo que buscas</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#F97316] text-center"
                >
                  {cat.imageUrl ? (
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-[#1B3A6B]/10 rounded-full flex items-center justify-center">
                      <Wrench className="h-7 w-7 text-[#1B3A6B]" />
                    </div>
                  )}
                  <h3 className="font-semibold text-[#1B3A6B] group-hover:text-[#F97316] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {cat._count.products} productos
                  </p>
                  <ChevronRight className="h-4 w-4 mx-auto mt-2 text-gray-400 group-hover:text-[#F97316] transition-colors" />
                </Link>
              ))
            ) : (
              // Fallback static categories
              [
                { name: "Rodamientos", slug: "rodamientos" },
                { name: "Piñones", slug: "pinones" },
                { name: "Correas", slug: "correas" },
                { name: "Ferretería", slug: "ferreteria" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-[#F97316] text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-3 bg-[#1B3A6B]/10 rounded-full flex items-center justify-center">
                    <Wrench className="h-7 w-7 text-[#1B3A6B]" />
                  </div>
                  <h3 className="font-semibold text-[#1B3A6B] group-hover:text-[#F97316] transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[#1B3A6B] mb-2">
                  Productos destacados
                </h2>
                <p className="text-gray-600">Los más vendidos de nuestra tienda</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/productos">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={Number(product.price)}
                  stock={product.stock}
                  featured={product.featured}
                  image={product.images[0]?.url}
                  category={product.category.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section id="nosotros" className="py-16 px-4 bg-[#1B3A6B] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="orange" className="mb-4">Sobre nosotros</Badge>
              <h2 className="text-3xl font-bold mb-6">
                Tu aliado en ferretería industrial
              </h2>
              <p className="text-blue-200 leading-relaxed mb-4">
                Somos una empresa especializada en la distribución de componentes
                industriales de alta calidad. Con años de experiencia en el mercado,
                hemos construido relaciones sólidas con los mejores proveedores.
              </p>
              <p className="text-blue-200 leading-relaxed mb-6">
                Nuestro equipo de expertos está listo para asesorarte en la selección
                de los productos más adecuados para tus necesidades industriales.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: "+500", label: "Productos" },
                  { value: "+1000", label: "Clientes" },
                  { value: "10+", label: "Años" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-lg p-4">
                    <p className="text-2xl font-bold text-[#F97316]">{stat.value}</p>
                    <p className="text-sm text-blue-200">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-2xl p-8 text-center">
                <Star className="h-16 w-16 text-[#F97316] mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Calidad garantizada</p>
                <p className="text-blue-200 text-sm">
                  Todos nuestros productos están certificados y cumplen con
                  los más altos estándares de calidad industrial.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1B3A6B] mb-4">
            ¿Listo para hacer tu pedido?
          </h2>
          <p className="text-gray-600 mb-8">
            Explora nuestro catálogo completo y encuentra los productos que necesitas
          </p>
          <Button variant="orange" size="lg" asChild>
            <Link href="/productos">
              Ir al catálogo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
