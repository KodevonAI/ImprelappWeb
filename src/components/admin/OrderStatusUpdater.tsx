"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const statuses = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PROCESSING", label: "En proceso" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (status === currentStatus) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast({ title: "Estado actualizado", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Error al actualizar el estado", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={isLoading || status === currentStatus}
      >
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Guardar
      </Button>
    </div>
  );
}
