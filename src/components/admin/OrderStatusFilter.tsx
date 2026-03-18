"use client";

import { useRouter, usePathname } from "next/navigation";

const statuses = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "PROCESSING", label: "En proceso" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
];

interface OrderStatusFilterProps {
  currentStatus?: string;
}

export default function OrderStatusFilter({ currentStatus }: OrderStatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() =>
            router.push(s.value ? `${pathname}?status=${s.value}` : pathname)
          }
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            currentStatus === s.value || (!currentStatus && s.value === "")
              ? "bg-[#1B3A6B] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
