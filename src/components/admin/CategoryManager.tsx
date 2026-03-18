"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, Trash2, Loader2, Check, X } from "lucide-react";
import { categorySchema, type CategoryFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  _count: { products: number };
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<CategoryFormData>({
      resolver: zodResolver(categorySchema),
      defaultValues: { active: true },
    });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast({
        title: editingId ? "Categoría actualizada" : "Categoría creada",
        variant: "success",
      });
      reset();
      setShowForm(false);
      setEditingId(null);
      router.refresh();
    } catch {
      toast({ title: "Error al guardar la categoría", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setValue("name", cat.name);
    setValue("description", cat.description || "");
    setValue("active", cat.active);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Categoría eliminada", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Lista de categorías</h2>
          <Button
            variant="orange"
            size="sm"
            onClick={() => {
              reset({ active: true });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
        <ul className="divide-y divide-gray-50">
          {initialCategories.map((cat) => (
            <li key={cat.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                  {cat.active ? (
                    <Badge variant="success" className="text-xs">Activa</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Inactiva</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {cat._count.products} productos · slug: {cat.slug}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(cat)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-red-500 hover:text-red-700"
                  disabled={cat._count.products > 0}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
          {initialCategories.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-400 text-sm">
              No hay categorías aún
            </li>
          )}
        </ul>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">
              {editingId ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); reset(); }}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input {...register("name")} className="mt-1" />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Descripción</Label>
              <Input {...register("description")} className="mt-1" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("active")}
                className="w-4 h-4 accent-[#1B3A6B]"
              />
              <span className="text-sm">Categoría activa</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit" variant="orange" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {editingId ? "Guardar" : "Crear"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingId(null); reset(); }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
