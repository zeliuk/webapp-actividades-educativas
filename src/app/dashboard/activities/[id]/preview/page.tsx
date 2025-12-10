"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getActivityById } from "@/lib/activitiesService";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";
import { toast } from "sonner";
import Header from "@/components/Header";

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

  if (!activity) return <p className="p-8">Cargando...</p>;

  return (
    <>
      <Header title={`Vista previa: ${activity.title}`} />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">



          <p className="text-sm text-gray-500 mb-4">
            Idioma: {activity.language === "es" ? "Español" : "Inglés"}
          </p>

          <div className="space-y-6">
            {activity.data.questions.map((q, i) => (
              <div key={i} className="border p-4 rounded-sm  bg-white">
                <h3 className="font-semibold mb-2">Pregunta {i + 1}</h3>
                <p className="mb-3">{q.question}</p>

                <ul className="space-y-1">
                  {q.options.map((opt, j) => (
                    <li
                      key={j}
                      className="border rounded-sm p-2"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom buttons */}
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


        </div>
      </main>
    </>

  );
}