import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: { orderId: string };
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "warning" },
  PROCESSING: { label: "En proceso", color: "info" },
  SHIPPED: { label: "Enviado", color: "info" },
  DELIVERED: { label: "Entregado", color: "success" },
  CANCELLED: { label: "Cancelado", color: "destructive" },
};

export default async function ConfirmationPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });

  if (!order) notFound();

  const statusInfo = statusMap[order.status] || { label: order.status, color: "default" };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">
          ¡Pedido confirmado!
        </h1>
        <p className="text-gray-600">
          Gracias por tu compra. Un asesor se pondrá en contacto pronto.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">Número de pedido</p>
            <p className="font-bold text-xl text-[#1B3A6B]">{order.orderNumber}</p>
          </div>
          <Badge variant={statusInfo.color as "warning" | "info" | "success" | "destructive" | "default"}>
            {statusInfo.label}
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-gray-500">Cliente</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{order.customerEmail}</p>
          </div>
          {order.customerPhone && (
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
          )}
          {order.addressCity && (
            <div>
              <p className="text-gray-500">Ciudad</p>
              <p className="font-medium">{order.addressCity}</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Productos
          </h3>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.productName}{" "}
                  <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatCurrency(Number(item.subtotal))}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-[#F97316]">{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">¿Qué sigue?</p>
        <p>
          Nuestro equipo revisará tu pedido y se pondrá en contacto contigo en
          las próximas 24 horas para confirmar disponibilidad, precio final con
          envío y método de pago.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link href="/productos">
            Seguir comprando
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
