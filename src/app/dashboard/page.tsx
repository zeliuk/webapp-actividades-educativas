"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { logoutUser } from "@/lib/authService";
import Link from "next/link"; // ⬅️ IMPORTANTE
import Header from "@/components/Header";

import { useTranslation } from "react-i18next";
import "@/i18n";


export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { user } = useAuth();

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-gray-700 mb-6">
            {t("sessionStartedAs")} <strong>{user?.email}</strong>
          </p>
        </div>
      </main>
    </>
  );
}