import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Plataforma educativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <AuthProvider>

          {/* HEADER GLOBAL */}
          <header className="bg-white shadow-sm py-4 mb-6">
            <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
              <h1 className="font-semibold text-lg">EduApp</h1>

              <nav className="flex gap-4">
                <Link href="/dashboard/activities">Actividades</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/profile">Perfil</Link>
              </nav>
            </div>
          </header>

          {/* CONTENIDO */}
          <main className="flex-1 max-w-6xl mx-auto px-4">
            {children}
          </main>

          {/* FOOTER GLOBAL */}
          <footer className="mt-10 py-6 bg-gray-200 text-center text-sm">
            © {new Date().getFullYear()} EduApp - Todos los derechos reservados
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
