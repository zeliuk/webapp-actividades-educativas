"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { logoutUser } from "@/lib/authService";

import { useTranslation } from "react-i18next";
import "@/i18n";

export default function DashboardPage() {
  const { t } = useTranslation("common"); // ✔️ Hook dentro
  const { user } = useAuth();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{t("welcome")}</h1>

      <p className="text-gray-700 mb-6">
        {t("sessionStartedAs")} <strong>{user?.email}</strong>
      </p>

      <Button onClick={logoutUser}>
        {t("logout")}
      </Button>
    </main>
  );
}
