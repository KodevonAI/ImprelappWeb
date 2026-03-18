import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.category.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar: {product.name}</h1>
      </div>

      <ProductForm
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          sku: product.sku,
          featured: product.featured,
          active: product.active,
          categoryId: product.categoryId,
          images: product.images,
        }}
      />
    </div>
  );
}
