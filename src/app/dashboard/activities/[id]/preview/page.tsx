"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ensureActivitySlug,
  forkActivity,
  getActivityById,
} from "@/lib/activitiesService";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Header from "@/components/Header";

type ActivityType = "quiz" | "anagram";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type AnagramPuzzle = {
  word: string;
  hint: string;
};

type Activity = {
  id: string;
  ownerId?: string;
  publicSlug?: string;
  title: string;
  language: "es" | "en";
  type: ActivityType;
  isPublic: boolean;
  data: {
    questions: Question[];
    anagrams: AnagramPuzzle[];
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
  const [currentIndex, setCurrentIndex] = useState(0);

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
        ownerId: result.ownerId,
        publicSlug: result.publicSlug,
        title: result.title,
        language: result.language ?? "es",
        type: (result.type ?? "quiz") as ActivityType,
        isPublic: result.isPublic ?? false,
        data: {
          questions: Array.isArray(result.data?.questions)
            ? result.data.questions
            : [],
          anagrams: Array.isArray(result.data?.anagrams)
            ? result.data.anagrams
            : [],
        },
      });
      setCurrentIndex(0);
    }

    load();
  }, [id, user, router]);

  const totalItems =
    activity?.type === "quiz"
      ? activity.data.questions.length
      : activity?.type === "anagram"
        ? activity.data.anagrams.length
        : 0;

  const currentQuestion =
    activity?.type === "quiz" && totalItems > 0
      ? activity.data.questions[currentIndex]
      : null;

  const currentAnagram =
    activity?.type === "anagram" && totalItems > 0
      ? activity.data.anagrams[currentIndex]
      : null;

  const isOwner = Boolean(
    user?.uid && activity?.ownerId && user.uid === activity.ownerId
  );

  if (!activity) return <p className="p-8">Cargando...</p>;

  return (
    <>
      <Header title={`Vista previa: ${activity.title}`} />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">



          <p className="text-sm text-gray-500">
            Idioma: {activity.language === "es" ? "Español" : "Inglés"}
          </p>

          <p className="text-sm text-gray-500 mb-4">
            Tipo:{" "}
            {activity.type === "quiz"
              ? "Quiz de opción múltiple"
              : "Anagramas"}
          </p>

          {totalItems === 0 ? (
            <p className="text-gray-500">
              {activity.type === "quiz"
                ? "No hay preguntas configuradas todavía."
                : "No hay palabras configuradas todavía."}
            </p>
          ) : (
            <>
              {activity.type === "quiz" && currentQuestion && (
                <div className="border p-4 rounded-sm bg-white">
                  <p className="text-sm text-gray-600 mb-2">
                    Pregunta {currentIndex + 1} de {totalItems}
                  </p>
                  <h3 className="font-semibold mb-2">{currentQuestion.question}</h3>

                  <ul className="space-y-1">
                    {currentQuestion.options.map((opt, j) => (
                      <li key={j} className="border rounded-sm p-2">
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.type === "anagram" && currentAnagram && (
                <div className="border p-4 rounded-sm bg-white">
                  <p className="text-sm text-gray-600 mb-2">
                    Palabra {currentIndex + 1} de {totalItems}
                  </p>
                  <h3 className="font-semibold mb-2">Solución</h3>
                  <p className="font-mono tracking-[0.3em] text-lg">
                    {currentAnagram.word?.toUpperCase().split("").join(" ")}
                  </p>
                  {currentAnagram.hint?.trim() ? (
                    <p className="text-sm text-gray-600 mt-2">
                      Pista: {currentAnagram.hint}
                    </p>
                  ) : null}
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(totalItems - 1, prev + 1)
                    )
                  }
                  disabled={currentIndex === totalItems - 1}
                >
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {/* Bottom buttons */}
          {isOwner && activity && (
            <div className="mt-6 flex justify-between">
              <Button
                onClick={() => router.push(`/dashboard/activities/${activity.id}`)}
              >
                Volver al editor
              </Button>

              <Button
                variant="secondary"
                onClick={async () => {
                  const slug =
                    activity.publicSlug ??
                    (await ensureActivitySlug(activity.id));
                  if (!activity.publicSlug) {
                    setActivity((prev) =>
                      prev ? { ...prev, publicSlug: slug } : prev
                    );
                  }
                  const url = `${window.location.origin}/a/${slug}`;
                  await navigator.clipboard.writeText(url);
                  toast.success("Enlace copiado al portapapeles");
                }}
              >
                Copiar enlace para alumnos
              </Button>
            </div>
          )}

          {!isOwner && activity && user && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={async () => {
                  try {
                    const newId = await forkActivity(activity.id, {
                      uid: user.uid,
                      displayName: user.displayName || undefined,
                    });
                    toast.success("Actividad duplicada en tu cuenta");
                    router.push(`/dashboard/activities/${newId}`);
                  } catch (error) {
                    console.error(error);
                    toast.error("No se pudo duplicar la actividad");
                  }
                }}
              >
                Duplicar en mi cuenta
              </Button>
            </div>
          )}


        </div>
      </main>
    </>

  );
}
