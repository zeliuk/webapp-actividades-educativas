import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";


export const metadata: Metadata = {
  title: "EduApp - Actividades educativas",
  description: "Plataforma para que Marian pueda crear y compartir actividades educativas entre docentes.",
  openGraph: {
    title: "EduApp - Actividades educativas",
    description:
      "Plataforma para que Marian pueda crear y compartir actividades educativas entre docentes.",
    url: "https://actividades.zeliuk.xyz",
    siteName: "EduApp",
    images: [
      {
        url: "/148980.png",
        width: 512,
        height: 512,
        alt: "EduApp",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/148980.png",
  },
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
