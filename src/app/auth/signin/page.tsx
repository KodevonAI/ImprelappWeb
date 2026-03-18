"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wrench, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
      setIsLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#1B3A6B] text-white px-6 py-3 rounded-xl mb-4">
            <div className="bg-[#F97316] p-1.5 rounded">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">IMPRELAPP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
                placeholder="admin@imprelapp.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
