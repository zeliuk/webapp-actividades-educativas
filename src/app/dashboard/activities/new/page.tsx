"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/context/AuthContext";
import { createActivity } from "@/lib/activitiesService";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";

const activityTypes = ["quiz", "anagram"] as const;

const newActivitySchema = z.object({
  title: z.string().min(3, "Debe tener al menos 3 caracteres"),
  type: z.enum(activityTypes),
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
        data: {
          questions: [],
          anagrams: [],
        },
      });

      toast.success("Actividad creada");
      router.push(`/dashboard/activities/${resp.id}`);
    } catch {
      toast.error("Error al crear la actividad");
    }
  }

  return (
    <>
      <Header title="Crear actividad" />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Título"
              {...register("title")}
              error={formState.errors.title?.message}
            />

            <Select label="Tipo" {...register("type")}>
              <option value="quiz">Quiz de opción múltiple</option>
              <option value="anagram">Anagramas</option>
            </Select>

            <Select label="Idioma de la actividad" {...register("language")}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </Select>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isPublic" {...register("isPublic")} />
              <label htmlFor="isPublic">Hacer pública</label>
            </div>

            <Button type="submit" full disabled={formState.isSubmitting}>
              Crear actividad
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
