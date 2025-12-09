"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validationSchemas";
import { z } from "zod";
import { registerWithEmail, loginWithGoogle } from "@/lib/authService";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";

import { toast } from "sonner";

import { useTranslation } from "react-i18next";
import "@/i18n";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { t } = useTranslation("common");  // ✔️ Hook dentro del componente
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerWithEmail(data.email, data.password);
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
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">{t("register")}</h1>

        <AuthCard title={t("register")}> 
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
              {t("register")}
            </Button>
          </form>

          <div className="mt-6">
            <Button variant="secondary" full onClick={handleGoogle}>
              {t("googleRegister")}
            </Button>
          </div>

          <p className="text-sm text-center mt-6 text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              {t("login")}
            </a>
          </p>
        </AuthCard>
      </section>
    </main>
  );
}
