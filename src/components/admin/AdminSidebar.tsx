"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1B3A6B] text-white flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-blue-700">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-[#F97316] p-2 rounded">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm">IMPRELAPP</p>
            <p className="text-xs text-blue-300">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-blue-300 hover:text-white transition-colors"
          target="_blank"
        >
          Ver tienda →
        </Link>
      </div>
    </aside>
  );
}
