import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingBag, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
  const [totalProducts, totalOrders, totalCategories, recentOrders, revenue] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.category.count({ where: { active: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);

  return { totalProducts, totalOrders, totalCategories, recentOrders, revenue };
}

const statusColors: Record<string, "warning" | "info" | "success" | "destructive" | "default"> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default async function AdminDashboard() {
  const { totalProducts, totalOrders, totalCategories, recentOrders, revenue } =
    await getDashboardStats();

  const stats = [
    {
      label: "Productos",
      value: totalProducts,
      icon: Package,
      href: "/admin/productos",
      color: "bg-blue-500",
    },
    {
      label: "Pedidos",
      value: totalOrders,
      icon: ShoppingBag,
      href: "/admin/pedidos",
      color: "bg-orange-500",
    },
    {
      label: "Categorías",
      value: totalCategories,
      icon: Tag,
      href: "/admin/categorias",
      color: "bg-green-500",
    },
    {
      label: "Ingresos totales",
      value: formatCurrency(Number(revenue._sum.total || 0)),
      icon: TrendingUp,
      href: "/admin/pedidos",
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#2563EB] hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Pedido</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    No hay pedidos aún
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-medium text-[#1B3A6B] hover:underline text-sm"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={statusColors[order.status] || "default"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("es-CO")}
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
