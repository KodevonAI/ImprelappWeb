"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category {
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  searchParams: {
    categoria?: string;
    busqueda?: string;
    minPrecio?: string;
    maxPrecio?: string;
  };
}

export default function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.busqueda || "");
  const [minPrice, setMinPrice] = useState(searchParams.minPrecio || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrecio || "");

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    if (searchParams.categoria && !overrides.categoria !== false) {
      params.set("categoria", searchParams.categoria);
    }
    if (search) params.set("busqueda", search);
    if (minPrice) params.set("minPrecio", minPrice);
    if (maxPrice) params.set("maxPrecio", maxPrice);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
      <div className="flex items-center gap-2 text-[#1B3A6B] font-semibold">
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
      </div>

      {/* Search */}
      <div>
        <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
          Búsqueda
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <Button
            size="icon"
            variant="default"
            onClick={() => applyFilters()}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
          Categoría
        </Label>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => applyFilters({ categoria: "" })}
              className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                !searchParams.categoria
                  ? "bg-[#1B3A6B] text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Todos
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <button
                onClick={() => applyFilters({ categoria: cat.slug })}
                className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                  searchParams.categoria === cat.slug
                    ? "bg-[#1B3A6B] text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
          Rango de precio
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="w-full mt-2 text-sm"
          onClick={() => applyFilters()}
        >
          Aplicar precio
        </Button>
      </div>

      {/* Clear */}
      <Button
        variant="ghost"
        className="w-full text-gray-500"
        onClick={clearFilters}
      >
        Limpiar filtros
      </Button>
    </div>
  );
}
