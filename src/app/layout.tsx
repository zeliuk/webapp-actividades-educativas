import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata = {
  title: "Plataforma educativa",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Toaster richColors position="top-center" />  {/* 👈 AÑADIDO */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}