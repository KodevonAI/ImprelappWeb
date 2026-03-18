import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/store/AddToCartButton";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description || `${product.name} - Imprelapp`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  const mainImage = product.images[0]?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1B3A6B]">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#1B3A6B]">Productos</Link>
        <span>/</span>
        <Link
          href={`/productos?categoria=${product.category.slug}`}
          className="hover:text-[#1B3A6B]"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[#1B3A6B] font-medium">{product.name}</span>
      </nav>

      <Link
        href="/productos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-24 w-24 text-gray-300" />
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <div
                  key={img.id}
                  className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#F97316] transition-colors"
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} imagen ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-2">
            <Link
              href={`/productos?categoria=${product.category.slug}`}
              className="text-sm text-[#2563EB] font-medium hover:underline uppercase tracking-wide"
            >
              {product.category.name}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#1B3A6B] mb-4">
            {product.name}
          </h1>

          {product.featured && (
            <Badge variant="orange" className="mb-4">Producto destacado</Badge>
          )}

          <p className="text-4xl font-bold text-[#F97316] mb-6">
            {formatCurrency(Number(product.price))}
          </p>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="border-t border-b border-gray-100 py-4 mb-6 space-y-2">
            {product.sku && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Disponibilidad:</span>
              <span
                className={`font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Categoría:</span>
              <span className="font-medium">{product.category.name}</span>
            </div>
          </div>

          <AddToCartButton
            id={product.id}
            name={product.name}
            price={Number(product.price)}
            stock={product.stock}
            image={mainImage}
            slug={product.slug}
          />
        </div>
      </div>
    </div>
  );
}
