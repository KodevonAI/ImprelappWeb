'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { slugify } from '@/lib/format'
import type { Category } from '@imprelapp/types'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  category?: Category | null
  categories: Category[]
  action: (formData: FormData) => Promise<void>
}

export function CategoryForm({ open, onClose, category, categories, action }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [parentId, setParentId] = useState(category?.parentId?.toString() ?? '')
  const [active, setActive] = useState(category?.active ?? true)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    if (!category) setSlug(slugify(e.target.value))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('active', String(active))
    if (parentId) fd.set('parentId', parentId)
    else fd.delete('parentId')

    startTransition(async () => {
      try {
        await action(fd)
        toast.success(category ? 'Categoría actualizada' : 'Categoría creada')
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  const availableParents = categories.filter(
    (c) => c.id !== category?.id && c.parentId !== category?.id
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nombre *</Label>
            <Input id="cat-name" name="name" value={name} onChange={handleNameChange} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug *</Label>
            <Input id="cat-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9\-]+" />
          </div>
          <div className="space-y-1.5">
            <Label>Categoría padre</Label>
            <Select value={parentId} onValueChange={(v) => setParentId(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Sin categoría padre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría padre</SelectItem>
                {availableParents.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-order">Orden</Label>
            <Input id="cat-order" name="order" type="number" defaultValue={category?.order ?? 0} />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${active ? 'bg-green-100 text-green-700 border-green-300' : 'border-border text-muted-foreground'}`}
            >
              {active ? '✓ Activa' : '✗ Inactiva'}
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
