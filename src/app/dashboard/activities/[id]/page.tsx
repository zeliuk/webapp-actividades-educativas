"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { getActivityById, updateActivity } from "@/lib/activitiesService";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthCard } from "@/components/AuthCard";
import { toast } from "sonner";

import Link from "next/link";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Activity = {
  id: string;
  title: string;
  type: string;
  isPublic: boolean;
  language: "es" | "en";
  data: {
    questions: Question[];
  };
};

export default function ActivityEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Next.js 16: params es una Promise
  const { user } = useAuth();
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar actividad
  useEffect(() => {
    if (!user) return;

    async function load() {
      const result = (await getActivityById(id)) as any; // <- aquí forzamos tipo flexible

      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/dashboard/activities");
        return;
      }

      setActivity({
        id: result.id,
        title: result.title ?? "",
        type: result.type ?? "quiz",
        isPublic: result.isPublic ?? false,
        language: (result.language ?? "es") as "es" | "en",
        data: {
          questions: Array.isArray(result.data?.questions)
            ? result.data.questions
            : [],
        },
      });

      setLoading(false);
    }

    load();
  }, [id, user, router]);

  // Guardar y volver al listado
  async function handleSave() {
    if (!activity) return;
    await updateActivity(activity.id, activity);
    toast.success("Actividad guardada");
    router.push("/dashboard/activities");
  }

  // Añadir pregunta
  function addQuestion() {
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            data: {
              questions: [
                ...prev.data.questions,
                { question: "", options: ["", "", "", ""], correctIndex: 0 },
              ],
            },
          }
        : prev
    );
  }

  // Actualizar texto de la pregunta
  function updateQuestion(index: number, value: string) {
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            data: {
              questions: prev.data.questions.map((q, i) =>
                i === index ? { ...q, question: value } : q
              ),
            },
          }
        : prev
    );
  }

  // Actualizar texto de una opción
  function updateOption(qIndex: number, optIndex: number, value: string) {
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            data: {
              questions: prev.data.questions.map((q, i) =>
                i === qIndex
                  ? {
                      ...q,
                      options: q.options.map((o, j) =>
                        j === optIndex ? value : o
                      ),
                    }
                  : q
              ),
            },
          }
        : prev
    );
  }

  // Marcar opción correcta
  function setCorrect(qIndex: number, optIndex: number) {
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            data: {
              questions: prev.data.questions.map((q, i) =>
                i === qIndex ? { ...q, correctIndex: optIndex } : q
              ),
            },
          }
        : prev
    );
  }

  // Eliminar pregunta (con confirmación)
  function removeQuestion(index: number) {
    toast("¿Eliminar esta pregunta?", {
      action: {
        label: "Sí",
        onClick: () => {
          setActivity((prev) =>
            prev
              ? {
                  ...prev,
                  data: {
                    questions: prev.data.questions.filter((_, i) => i !== index),
                  },
                }
              : prev
          );
          toast.success("Pregunta eliminada");
        },
      },
    });
  }

  // Duplicar pregunta
  function duplicateQuestion(index: number) {
    setActivity((prev) =>
      prev
        ? {
            ...prev,
            data: {
              questions: [
                ...prev.data.questions.slice(0, index + 1),
                { ...prev.data.questions[index] },
                ...prev.data.questions.slice(index + 1),
              ],
            },
          }
        : prev
    );
    toast.success("Pregunta duplicada");
  }

  // Mover pregunta hacia arriba
  function moveQuestionUp(index: number) {
    if (index === 0) return;

    setActivity((prev) => {
      if (!prev) return prev;

      const questions = [...prev.data.questions];
      [questions[index - 1], questions[index]] = [
        questions[index],
        questions[index - 1],
      ];

      return { ...prev, data: { questions } };
    });
  }

  // Mover pregunta hacia abajo
  function moveQuestionDown(index: number) {
    if (!activity || index === activity.data.questions.length - 1) return;

    setActivity((prev) => {
      if (!prev) return prev;

      const questions = [...prev.data.questions];
      [questions[index + 1], questions[index]] = [
        questions[index],
        questions[index + 1],
      ];

      return { ...prev, data: { questions } };
    });
  }

  if (loading || !activity) {
    return <p className="p-6">Cargando...</p>;
  }

  return (
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Editor de actividad</h1>

        <AuthCard title="Detalles de la actividad">

        {/* Título */}
        <Input
          label="Título"
          value={activity.title}
          onChange={(e) =>
            setActivity({ ...activity, title: e.target.value })
          }
        />

        {/* Idioma */}
        <div className="mt-4">
          <label className="block font-medium">Idioma de la actividad</label>
          <select
            className="w-full p-2 border rounded-lg mt-1"
            value={activity.language}
            onChange={(e) =>
              setActivity({
                ...activity,
                language: e.target.value as "es" | "en",
              })
            }
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>

        {/* Privacidad */}
        <div className="mt-4">
          <label className="block font-medium">Privacidad</label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="checkbox"
              checked={activity.isPublic}
              onChange={(e) =>
                setActivity({ ...activity, isPublic: e.target.checked })
              }
            />
            <span>Hacer pública</span>
          </div>
        </div>

        {/* Preguntas */}
        <div className="mt-6 space-y-6">
          <h2 className="text-lg font-semibold">Preguntas</h2>

          {activity.data.questions.map((q, qIndex) => (
            <div key={qIndex} className="border p-4 rounded-lg">
              {/* Cabecera de la pregunta */}
              <div className="flex justify-between mb-3">
                <h3 className="font-semibold">Pregunta {qIndex + 1}</h3>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => moveQuestionUp(qIndex)}
                  >
                    ▲
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => moveQuestionDown(qIndex)}
                  >
                    ▼
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => duplicateQuestion(qIndex)}
                  >
                    Duplicar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>

              {/* Texto de la pregunta */}
              <Input
                label="Texto de la pregunta"
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, e.target.value)}
              />

              {/* Opciones */}
              <div className="mt-3 space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex}>
                    <label className="block text-sm font-medium">
                      Opción {optIndex + 1}
                    </label>

                    <input
                      className="w-full p-2 border rounded-lg"
                      value={opt}
                      onChange={(e) =>
                        updateOption(qIndex, optIndex, e.target.value)
                      }
                    />

                    <div className="mt-1">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctIndex === optIndex}
                        onChange={() => setCorrect(qIndex, optIndex)}
                      />{" "}
                      Respuesta correcta
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botones inferiores */}
        <div className="mt-6 flex justify-between">
          <Button onClick={addQuestion}>Añadir pregunta</Button>

          <div className="flex gap-6">
            {/* Botón de PREVIEW */}
            <Link href={`/dashboard/activities/${activity.id}/preview`}>
              <Button variant="secondary">Preview</Button>
            </Link>

            {/* Botón de guardar */}
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        </div>

      </AuthCard>
      </section>
    </main>
  );
}