"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Panel de administración
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 bg-[#1B3A6B] rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:block">{user?.email}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="text-gray-500 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </div>
    </header>
  );
}
