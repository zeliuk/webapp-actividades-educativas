"use client";

import { auth } from "@/lib/firebase";

export default function Home() {
  console.log("Firebase Auth:", auth);

  return (
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Inicio</h1>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div>Firebase cargado correctamente ✔️</div>
        </div>
      </section>
    </main>
  );
}