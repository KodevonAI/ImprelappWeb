import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
