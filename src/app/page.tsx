"use client";

import Header from "@/components/Header";
import { auth } from "@/lib/firebase";

export default function Home() {
  console.log("Firebase Auth:", auth);

  return (
    <>
      <Header title="¡Hola!" />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        </div>
      </main>
    </>
  );
}