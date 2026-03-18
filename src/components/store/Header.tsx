"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Wrench } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCartStore();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "/#categorias", label: "Categorías" },
    { href: "/#nosotros", label: "Nosotros" },
  ];

  return (
    <header className="bg-[#1B3A6B] text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#F97316] p-2 rounded">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide">IMPRELAPP</span>
              <p className="text-xs text-blue-200 leading-none">Ferretería Industrial</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-100 hover:text-white hover:text-[#F97316] transition-colors text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart + Mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-[#F97316] transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F97316] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-blue-100 hover:text-white py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
