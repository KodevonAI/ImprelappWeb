"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/hooks/use-toast";

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  slug: string;
}

export default function AddToCartButton({
  id,
  name,
  price,
  stock,
  image,
  slug,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    addItem({ id, name, price, image, slug });
    toast({
      title: "Producto agregado al carrito",
      description: name,
      variant: "success",
    });
    openCart();
  };

  return (
    <div className="space-y-3">
      <Button
        variant="orange"
        size="lg"
        className="w-full"
        disabled={stock === 0}
        onClick={handleAddToCart}
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        {stock > 0 ? "Agregar al carrito" : "Producto agotado"}
      </Button>
      {stock > 0 && stock <= 5 && (
        <p className="text-sm text-orange-600 text-center">
          ¡Solo quedan {stock} unidades disponibles!
        </p>
      )}
    </div>
  );
}
