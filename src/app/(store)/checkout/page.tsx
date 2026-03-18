"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price,
            productName: item.name,
          })),
          total: totalPrice(),
        }),
      });

      if (!res.ok) throw new Error("Error al crear el pedido");

      const order = await res.json();
      clearCart();
      router.push(`/confirmacion/${order.id}`);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo procesar tu pedido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center px-4">
        <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">Agrega productos antes de continuar al pago</p>
        <Button asChild>
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-8">Finalizar compra</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-lg text-[#1B3A6B] mb-4">
                Datos del cliente
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="customerName">Nombre completo *</Label>
                  <Input
                    id="customerName"
                    {...register("customerName")}
                    className="mt-1"
                    placeholder="Tu nombre completo"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail")}
                    className="mt-1"
                    placeholder="tu@email.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    {...register("customerPhone")}
                    className="mt-1"
                    placeholder="+57 300 000 0000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-lg text-[#1B3A6B] mb-4">
                Dirección de entrega (opcional)
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="addressStreet">Dirección</Label>
                  <Input
                    id="addressStreet"
                    {...register("addressStreet")}
                    className="mt-1"
                    placeholder="Calle, número, apartamento..."
                  />
                </div>
                <div>
                  <Label htmlFor="addressCity">Ciudad</Label>
                  <Input
                    id="addressCity"
                    {...register("addressCity")}
                    className="mt-1"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <Label htmlFor="addressState">Departamento</Label>
                  <Input
                    id="addressState"
                    {...register("addressState")}
                    className="mt-1"
                    placeholder="Departamento"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-lg text-[#1B3A6B] mb-4">
                Notas adicionales
              </h2>
              <Textarea
                {...register("notes")}
                placeholder="Instrucciones especiales de entrega, referencias, etc."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              variant="orange"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando pedido...
                </>
              ) : (
                `Confirmar pedido • ${formatCurrency(totalPrice())}`
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-[#1B3A6B] mb-4">
              Resumen del pedido
            </h2>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} <span className="text-gray-400">x{item.quantity}</span>
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#F97316]">{formatCurrency(totalPrice())}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Los precios no incluyen envío. Un asesor se pondrá en contacto
              para confirmar disponibilidad y costos de envío.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
