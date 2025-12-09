"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b py-4 fixed w-full top-0 z-10">
      <div className="max-w-6xl mx-auto flex items-center justify-end px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center mr-auto gap-2">
          <span className="text-2xl font-bold">EduApp</span>
        </Link>

        {/* NAV */}
        <nav className="flex items-center mr-6 gap-6 font-medium">
          <Link href="/activities/public">Comunidad</Link>
          <Link href="/dashboard/activities">Mis actividades</Link>

          <Link
            href="/dashboard/activities/new"
          >
            Crear actividad
          </Link>
        </nav>

        {/* AUTENTICACIÓN */}
        <div>
          {!user ? (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="secondary">Iniciar sesión</Button>
              </Link>

              <Link href="/register">
                <Button variant="primary">Registrarse</Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-50"
              >
                <span>{user.displayName || user.email}</span>
                <span>▼</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-40">
                  <Link
                    href="/dashboard/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Perfil
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}