import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SessionProvider from "@/components/shared/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Imprelapp | Ferretería Industrial",
    template: "%s | Imprelapp",
  },
  description:
    "Rodamientos, piñones, correas y ferretería industrial. Tu proveedor de confianza.",
  keywords: ["rodamientos", "piñones", "correas", "ferretería", "industrial"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
