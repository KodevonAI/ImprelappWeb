'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { slugify } from '@/lib/format'
import { Trash2, Upload, Link as LinkIcon } from 'lucide-react'
import type { Product, Category, ProductImage } from '@imprelapp/types'

interface ProductFormProps {
  product?: Product & { images?: ProductImage[]; category?: Pick<Category, 'id' | 'name' | 'slug'> | null }
  categories: Category[]
  action: (formData: FormData) => Promise<void>
}

export function ProductForm({ product, categories, action }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [imageUrl, setImageUrl] = useState('')
  const [localImages, setLocalImages] = useState<File[]>([])
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [active, setActive] = useState(product?.active ?? true)
  const [categoryId, setCategoryId] = useState(product?.categoryId?.toString() ?? '')

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (!product) setSlug(slugify(val))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setLocalImages((prev) => [...prev, ...files])
  }

  function removeLocalImage(idx: number) {
    setLocalImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('featured', String(featured))
    fd.set('active', String(active))
    if (categoryId) fd.set('categoryId', categoryId)
    else fd.delete('categoryId')
    localImages.forEach((f) => fd.append('images', f))

    startTransition(async () => {
      try {
        await action(fd)
        toast.success(product ? 'Producto actualizado' : 'Producto creado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" value={name} onChange={handleNameChange} required />
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" />
          <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones</p>
        </div>

        {/* Precio */}
        <div className="space-y-1.5">
          <Label htmlFor="price">Precio (COP) *</Label>
          <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price} required />
        </div>

        {/* Precio comparación */}
        <div className="space-y-1.5">
          <Label htmlFor="comparePrice">Precio antes (tachado)</Label>
          <Input id="comparePrice" name="comparePrice" type="number" min="0" step="0.01" defaultValue={product?.comparePrice ?? ''} />
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} />
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ''} />
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="Sin categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin categoría</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Flags */}
        <div className="space-y-3">
          <Label>Opciones</Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFeatured(!featured)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${featured ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {featured ? '★ Destacado' : '☆ Destacar'}
            </button>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${active ? 'bg-green-100 text-green-700 border-green-300' : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {active ? '✓ Activo' : '✗ Inactivo'}
            </button>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" rows={4} defaultValue={product?.description ?? ''} />
      </div>

      {/* Imágenes existentes */}
      {product?.images && product.images.length > 0 && (
        <div className="space-y-2">
          <Label>Imágenes actuales</Label>
          <div className="flex flex-wrap gap-3">
            {product.images.map((img) => (
              <div key={img.id} className="relative group">
                <div className="h-24 w-24 rounded-lg border overflow-hidden bg-muted">
                  <Image
                    src={img.url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${img.url}` : img.url}
                    alt={img.alt ?? ''}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subir imágenes */}
      <div className="space-y-3">
        <Label>Agregar imágenes</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Upload className="size-3.5" /> Subir archivo
            </div>
            <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
            {localImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {localImages.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-muted rounded px-2 py-1 text-xs">
                    {f.name}
                    <button type="button" onClick={() => removeLocalImage(i)}>
                      <Trash2 className="size-3 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <LinkIcon className="size-3.5" /> URL de imagen
            </div>
            <Input
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : product ? 'Actualizar producto' : 'Crear producto'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
