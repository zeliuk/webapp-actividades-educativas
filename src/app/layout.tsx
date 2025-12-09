import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

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
    <html lang="es" className="h-full bg-gray-100">
      <body className="h-full">
        <AuthProvider>

          <div className="min-h-full">
            {/* NAVBAR (100% react, igual al original de TailwindUI) */}
            <NavBar />

            {/* CONTENIDO PRINCIPAL */}
            {children}

            {/* FOOTER 
            <Footer />*/}
          </div>
          
        </AuthProvider>
      </body>
    </html>
  );
}
