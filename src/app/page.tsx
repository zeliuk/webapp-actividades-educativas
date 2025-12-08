"use client";

import { auth } from "@/lib/firebase";

export default function Home() {
  console.log("Firebase Auth:", auth);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div>Firebase cargado correctamente ✔️</div>
    </main>
  );
}