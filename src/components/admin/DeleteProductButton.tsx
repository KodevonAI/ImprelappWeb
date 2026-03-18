"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface DeleteProductButtonProps {
  id: string;
  name: string;
}

export default function DeleteProductButton({ id, name }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Producto eliminado", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
