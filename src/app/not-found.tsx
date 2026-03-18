import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1B3A6B] rounded-full mb-6">
          <Wrench className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-[#1B3A6B] mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Página no encontrada</p>
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="orange" asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
