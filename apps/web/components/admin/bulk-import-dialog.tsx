'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

interface BulkImportResult {
  created: number
  errors: Array<{ row: number; message: string }>
}

interface BulkImportDialogProps {
  action: (csv: string) => Promise<BulkImportResult>
}

export function BulkImportDialog({ action }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<BulkImportResult | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setFile(null)
      setResult(null)
    }
  }

  function handleUpload() {
    if (!file) return
    startTransition(async () => {
      try {
        const text = await file.text()
        const res = await action(text)
        setResult(res)
        if (res.errors.length === 0) {
          toast.success(`${res.created} productos creados`)
        } else {
          toast.warning(`${res.created} creados, ${res.errors.length} con errores`)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al importar')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
        <Upload className="size-4 mr-1" /> Cargar CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cargar productos desde CSV</DialogTitle>
          <DialogDescription>
            Usa el template descargable para el formato correcto. Las categorías se asignan por nombre o slug — deben existir previamente.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null)
            setResult(null)
          }}
          className="w-full text-sm file:mr-3 file:h-8 file:px-3 file:rounded-lg file:border file:bg-background file:text-sm file:cursor-pointer"
        />

        {result && (
          <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
            <p className="font-medium">{result.created} productos creados</p>
            {result.errors.length > 0 && (
              <ul className="space-y-1 text-destructive">
                {result.errors.map((e, i) => (
                  <li key={i}>Fila {e.row}: {e.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cerrar</Button>
          <Button onClick={handleUpload} disabled={!file || isPending}>
            {isPending ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
