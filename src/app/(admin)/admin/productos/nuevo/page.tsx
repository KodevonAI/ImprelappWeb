import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
