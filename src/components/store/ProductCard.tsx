"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  featured?: boolean;
  image?: string;
  category?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  stock,
  featured,
  image,
  category,
}: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({ id, name, price, image, slug });
    toast({
      title: "Producto agregado",
      description: `${name} se agregó al carrito`,
      variant: "success",
    });
    openCart();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
      <Link href={`/productos/${slug}`}>
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {featured && (
            <div className="absolute top-2 left-2">
              <Badge variant="orange">Destacado</Badge>
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {category && (
          <p className="text-xs text-[#2563EB] font-medium mb-1 uppercase tracking-wide">
            {category}
          </p>
        )}
        <Link href={`/productos/${slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-[#1B3A6B] transition-colors line-clamp-2 mb-2">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-[#F97316]">
            {formatCurrency(price)}
          </p>
          <span className={`text-xs ${stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {stock > 0 ? `${stock} en stock` : "Agotado"}
          </span>
        </div>
        <Button
          variant="orange"
          className="w-full mt-3"
          disabled={stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
