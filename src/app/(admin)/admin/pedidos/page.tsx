import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import OrderStatusFilter from "@/components/admin/OrderStatusFilter";

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

interface PageProps {
  searchParams: { status?: string };
}

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const where = searchParams.status ? { status: searchParams.status as never } : {};

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <OrderStatusFilter currentStatus={searchParams.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No hay pedidos{searchParams.status ? " con este estado" : " aún"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="font-medium text-sm text-[#1B3A6B] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || "default"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-xs text-[#2563EB] hover:underline"
                      >
                        Ver →
                      </Link>
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
