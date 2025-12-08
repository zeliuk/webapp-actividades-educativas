"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validationSchemas";
import { z } from "zod";
import { loginWithEmail, loginWithGoogle } from "@/lib/authService";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";

import { toast } from "sonner";

import { useTranslation } from "react-i18next";
import "@/i18n";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation("common"); // ✅ AHORA SÍ VA DENTRO DEL COMPONENTE

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      await loginWithEmail(data.email, data.password);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleGoogle() {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <AuthCard title={t("login")}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label={t("email")}
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label={t("password")}
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />

        <Button type="submit" full disabled={isSubmitting}>
          {t("login")}
        </Button>
      </form>

      <div className="mt-4">
        <Button variant="secondary" full onClick={handleGoogle}>
          {t("googleLogin")}
        </Button>
      </div>

      <p className="text-sm text-center mt-4 text-gray-600">
        ¿No tienes cuenta?{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          {t("register")}
        </a>
      </p>
    </AuthCard>
  );
}