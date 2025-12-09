"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getActivityById } from "@/lib/activitiesService";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";
import { toast } from "sonner";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Activity = {
  id: string;
  title: string;
  language: "es" | "en";
  isPublic: boolean;
  data: {
    questions: Question[];
  };
};

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const result = (await getActivityById(id)) as any;
      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/dashboard/activities");
        return;
      }

      setActivity({
        id: result.id,
        title: result.title,
        language: result.language ?? "es",
        isPublic: result.isPublic ?? false,
        data: {
          questions: Array.isArray(result.data?.questions)
            ? result.data.questions
            : [],
        },
      });
    }

    load();
  }, [id, user, router]);

  if (!activity) return <p className="p-6">Cargando...</p>;

  return (
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">
          Vista previa: {activity.title}
        </h1>

        <AuthCard title="Contenido de la actividad">
          <p className="text-sm text-gray-500 mb-4">
            Idioma: {activity.language === "es" ? "Español" : "Inglés"}
          </p>

          <div className="space-y-6">
            {activity.data.questions.map((q, i) => (
              <div key={i} className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Pregunta {i + 1}</h3>
                <p className="mb-3">{q.question}</p>

                <ul className="space-y-1">
                  {q.options.map((opt, j) => (
                    <li
                      key={j}
                      className="border rounded-lg p-2 bg-white"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button onClick={() => router.push(`/dashboard/activities/${id}`)}>
              Volver al editor
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                const url = `${window.location.origin}/a/${id}`;
                await navigator.clipboard.writeText(url);
                toast.success("Enlace copiado al portapapeles");
              }}
            >
              Copiar enlace para alumnos
            </Button>
          </div>
        </AuthCard>
      </section>
    </main>
  );
}
