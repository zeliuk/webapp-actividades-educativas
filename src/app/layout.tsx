import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";


export const metadata: Metadata = {
  title: "Plataforma educativa",
  description: "Descripción...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-gray-100" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Toaster position="bottom-right" richColors />
          {/* Todo lo que depende del pathname se resuelve aquí */}
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
