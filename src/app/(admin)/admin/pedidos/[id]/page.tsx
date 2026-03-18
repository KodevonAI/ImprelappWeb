import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

interface Props {
  params: { id: string };
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

export default async function AdminOrderDetailPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B3A6B] mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a pedidos
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Creado el{" "}
              {new Date(order.createdAt).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge variant={statusColors[order.status] || "default"} className="text-sm px-3 py-1">
            {statusLabels[order.status] || order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Datos del cliente</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Nombre</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{order.customerEmail}</dd>
            </div>
            {order.customerPhone && (
              <div>
                <dt className="text-gray-500">Teléfono</dt>
                <dd className="font-medium">{order.customerPhone}</dd>
              </div>
            )}
            {order.addressCity && (
              <div>
                <dt className="text-gray-500">Ciudad</dt>
                <dd className="font-medium">{order.addressCity}</dd>
              </div>
            )}
            {order.addressStreet && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Dirección</dt>
                <dd className="font-medium">{order.addressStreet}</dd>
              </div>
            )}
            {order.notes && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Notas</dt>
                <dd className="font-medium">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Productos</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-gray-500">
                    {formatCurrency(Number(item.unitPrice))} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(Number(item.subtotal))}</p>
              </li>
            ))}
          </ul>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#F97316]">{formatCurrency(Number(order.total))}</span>
          </div>
        </div>

        {/* Status Updater */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Actualizar estado</h2>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
