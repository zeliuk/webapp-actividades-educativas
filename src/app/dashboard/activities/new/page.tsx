"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/context/AuthContext";
import { createActivity } from "@/lib/activitiesService";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

const newActivitySchema = z.object({
  title: z.string().min(3, "Debe tener al menos 3 caracteres"),
  type: z.enum(["quiz"]),
  isPublic: z.boolean().optional(),
  language: z.enum(["es", "en"]),
});

type NewActivityForm = z.infer<typeof newActivitySchema>;

export default function NewActivityPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { register, handleSubmit, formState } = useForm<NewActivityForm>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: {
      type: "quiz",
      isPublic: false,
      language: "es",
    },
  });

  async function onSubmit(data: NewActivityForm) {
    if (!user) return;

    try {
      const resp = await createActivity({
        ...data,
        ownerId: user.uid,
        data: { questions: [] },
      });

      toast.success("Actividad creada");
      router.push(`/dashboard/activities/${resp.id}`);
    } catch (err) {
      toast.error("Error al crear la actividad");
    }
  }

  return (
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Crear actividad</h1>

        <AuthCard title="Detalles de la actividad">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Título"
              {...register("title")}
              error={formState.errors.title?.message}
            />

            <div className="space-y-2">
              <label className="block font-medium">Tipo</label>
              <select {...register("type")} className="w-full p-2 border rounded-lg">
                <option value="quiz">Quiz</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Idioma de la actividad</label>
              <select
                {...register("language")}
                className="w-full p-2 border rounded-lg"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPublic" {...register("isPublic")} />
              <label htmlFor="isPublic">Hacer pública</label>
            </div>

            <Button type="submit" full disabled={formState.isSubmitting}>
              Crear actividad
            </Button>
          </form>
        </AuthCard>
      </section>
    </main>
  );
}