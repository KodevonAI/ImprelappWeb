"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import { productSchema, type ProductFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    sku?: string | null;
    featured: boolean;
    active: boolean;
    categoryId: string;
    images: { id: string; url: string }[];
  };
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.images.map((i) => i.url) || []
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          price: initialData.price,
          stock: initialData.stock,
          sku: initialData.sku || "",
          featured: initialData.featured,
          active: initialData.active,
          categoryId: initialData.categoryId,
        }
      : {
          featured: false,
          active: true,
          stock: 0,
        },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", initialData?.id || "new");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setUploadedImages((prev) => [...prev, url]);
      toast({ title: "Imagen subida correctamente", variant: "success" });
    } catch {
      toast({ title: "Error al subir imagen", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const url = initialData
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images: uploadedImages }),
      });

      if (!res.ok) throw new Error();

      const product = await res.json();

      // Save images for any product (new or updated)
      if (uploadedImages.length > 0) {
        await fetch(`/api/products/${product.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: uploadedImages }),
        });
      }

      toast({
        title: initialData ? "Producto actualizado" : "Producto creado",
        variant: "success",
      });
      router.push("/admin/productos");
      router.refresh();
    } catch {
      toast({ title: "Error al guardar el producto", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información básica</h2>

        <div>
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            {...register("description")}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Precio (COP) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price")}
              className="mt-1"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              type="number"
              {...register("stock")}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} className="mt-1" placeholder="Código único" />
          </div>
          <div>
            <Label>Categoría *</Label>
            <Select
              defaultValue={initialData?.categoryId}
              onValueChange={(v) => setValue("categoryId", v)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("featured")}
              className="w-4 h-4 accent-[#F97316]"
            />
            <span className="text-sm">Producto destacado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("active")}
              className="w-4 h-4 accent-[#1B3A6B]"
            />
            <span className="text-sm">Activo (visible en tienda)</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Imágenes</h2>

        <div className="flex flex-wrap gap-3 mb-4">
          {uploadedImages.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
              <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1B3A6B] transition-colors">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Subir</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" variant="orange" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
