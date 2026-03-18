import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Plus, Edit, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Button variant="orange" asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No hay productos aún</p>
                    <Button className="mt-3" asChild>
                      <Link href="/admin/productos/nuevo">Crear primer producto</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-900">{product.name}</p>
                          {product.sku && (
                            <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(Number(product.price))}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-600 font-medium"
                            : product.stock <= 5
                            ? "text-yellow-600 font-medium"
                            : "text-gray-700"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {product.active ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="outline">Inactivo</Badge>
                        )}
                        {product.featured && (
                          <Badge variant="orange">Destacado</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/productos/${product.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
