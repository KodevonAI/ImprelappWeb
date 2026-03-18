"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-[#1B3A6B] text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Carrito ({items.length})</h2>
          </div>
          <button onClick={closeCart} className="p-1 hover:opacity-70">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-1">Agrega productos para continuar</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={closeCart}
                asChild
              >
                <Link href="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  {item.image ? (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-[#F97316] font-semibold">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded border hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded border hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-lg text-[#1B3A6B]">
                {formatCurrency(totalPrice())}
              </span>
            </div>
            <Button
              variant="orange"
              className="w-full"
              asChild
              onClick={closeCart}
            >
              <Link href="/checkout">Proceder al pago</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={closeCart} asChild>
              <Link href="/productos">Seguir comprando</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
