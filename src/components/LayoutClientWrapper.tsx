"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function LayoutClientWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const hideBlock = pathname.startsWith("/a/");

    return (
        <>
            {!hideBlock && <NavBar />}

            <main className="flex-1">
                {children}
            </main>

            {!hideBlock && <Footer />}
        </>
    );
}
