import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/store/ProductCard";
import ProductFilters from "@/components/store/ProductFilters";
import { Loader2 } from "lucide-react";

interface ProductsPageProps {
  searchParams: {
    categoria?: string;
    busqueda?: string;
    pagina?: string;
    minPrecio?: string;
    maxPrecio?: string;
  };
}

const ITEMS_PER_PAGE = 12;

async function getProducts(searchParams: ProductsPageProps["searchParams"]) {
  const page = parseInt(searchParams.pagina || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: {
    active: boolean;
    category?: { slug: string };
    name?: { contains: string; mode: "insensitive" };
    price?: { gte?: number; lte?: number };
  } = { active: true };

  if (searchParams.categoria) {
    where.category = { slug: searchParams.categoria };
  }

  if (searchParams.busqueda) {
    where.name = { contains: searchParams.busqueda, mode: "insensitive" };
  }

  if (searchParams.minPrecio || searchParams.maxPrecio) {
    where.price = {};
    if (searchParams.minPrecio) where.price.gte = parseFloat(searchParams.minPrecio);
    if (searchParams.maxPrecio) where.price.lte = parseFloat(searchParams.maxPrecio);
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { active: true },
      select: { name: true, slug: true },
    }),
  ]);

  return { products, total, categories, page, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, total, categories, page, totalPages } = await getProducts(searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1B3A6B]">Catálogo de productos</h1>
        <p className="text-gray-600 mt-1">{total} productos encontrados</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters categories={categories} searchParams={searchParams} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
              </div>
            }
          >
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">No se encontraron productos</p>
                <p className="text-gray-400 mt-2">Intenta ajustar los filtros</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...searchParams, pagina: String(p) })}`}
                        className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-[#1B3A6B] text-white border-[#1B3A6B]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#1B3A6B]"
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
