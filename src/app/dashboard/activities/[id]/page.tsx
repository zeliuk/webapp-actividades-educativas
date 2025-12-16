"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import { getActivityById, updateActivity } from "@/lib/activitiesService";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
  title: string;
  type: ActivityType;
  isPublic: boolean;
  language: "es" | "en";
  data: {
    questions: Question[];
    anagrams: AnagramPuzzle[];
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

      if (result.ownerId && result.ownerId !== user.uid) {
        toast.error("No tienes permisos para editar esta actividad");
        router.push("/dashboard/activities");
        return;
      }

      setActivity({
        id: result.id,
        title: result.title ?? "",
        type: (result.type ?? "quiz") as ActivityType,
        isPublic: result.isPublic ?? false,
        language: (result.language ?? "es") as "es" | "en",
        data: {
          questions: Array.isArray(result.data?.questions)
            ? result.data.questions
            : [],
          anagrams: Array.isArray(result.data?.anagrams)
            ? result.data.anagrams
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
            ...prev.data,
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
            ...prev.data,
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
            ...prev.data,
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
            ...prev.data,
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
                  ...prev.data,
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
            ...prev.data,
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

      return { ...prev, data: { ...prev.data, questions } };
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

      return { ...prev, data: { ...prev.data, questions } };
    });
  }

  // Añadir palabra de anagrama
  function addAnagram() {
    setActivity((prev) =>
      prev
        ? {
          ...prev,
          data: {
            ...prev.data,
            anagrams: [...prev.data.anagrams, { word: "", hint: "" }],
          },
        }
        : prev
    );
  }

  function updateAnagramWord(index: number, value: string) {
    setActivity((prev) =>
      prev
        ? {
          ...prev,
          data: {
            ...prev.data,
            anagrams: prev.data.anagrams.map((item, i) =>
              i === index ? { ...item, word: value } : item
            ),
          },
        }
        : prev
    );
  }

  function updateAnagramHint(index: number, value: string) {
    setActivity((prev) =>
      prev
        ? {
          ...prev,
          data: {
            ...prev.data,
            anagrams: prev.data.anagrams.map((item, i) =>
              i === index ? { ...item, hint: value } : item
            ),
          },
        }
        : prev
    );
  }

  function moveAnagramUp(index: number) {
    if (index === 0) return;

    setActivity((prev) => {
      if (!prev) return prev;

      const anagrams = [...prev.data.anagrams];
      [anagrams[index - 1], anagrams[index]] = [
        anagrams[index],
        anagrams[index - 1],
      ];

      return { ...prev, data: { ...prev.data, anagrams } };
    });
  }

  function moveAnagramDown(index: number) {
    if (!activity || index === activity.data.anagrams.length - 1) return;

    setActivity((prev) => {
      if (!prev) return prev;

      const anagrams = [...prev.data.anagrams];
      [anagrams[index + 1], anagrams[index]] = [
        anagrams[index],
        anagrams[index + 1],
      ];

      return { ...prev, data: { ...prev.data, anagrams } };
    });
  }

  function removeAnagram(index: number) {
    toast("¿Eliminar esta palabra?", {
      action: {
        label: "Sí",
        onClick: () => {
          setActivity((prev) =>
            prev
              ? {
                ...prev,
                data: {
                  ...prev.data,
                  anagrams: prev.data.anagrams.filter((_, i) => i !== index),
                },
              }
              : prev
          );
          toast.success("Palabra eliminada");
        },
      },
    });
  }

  if (loading || !activity) {
    return <p className="p-8">Cargando...</p>;
  }

  return (
    <>
      <Header title={"Editando: " + activity.title || "Nueva actividad"} />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


          {/* INFORMACIÓN GENERAL */}
          <section className="p-6 border rounded-sm bg-white">
            <h2 className="text-xl font-semibold mb-4">Información general</h2>

            {/* Título */}
            <Input
              label="Título"
              value={activity.title}
              onChange={(e) =>
                setActivity({ ...activity, title: e.target.value })
              }
            />

            {/* Tipo (solo lectura) */}
            <div className="mt-4">
              <Select
                label="Tipo de actividad"
                value={activity.type}
                disabled
                helperText="El tipo se define al crear la actividad."
              >
                <option value="quiz">Quiz de opción múltiple</option>
                <option value="anagram">Anagramas</option>
              </Select>
            </div>

            {/* Idioma */}
            <div className="mt-4">
              <Select
                label="Idioma de la actividad"
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
              </Select>
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
          </section>

          {activity.type === "quiz" ? (
            <section className="p-6 mt-6 border rounded-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Preguntas</h2>
              </div>

              <div className="space-y-6">
                {activity.data.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border mb-6 p-5 rounded-sm bg-black-50">

                    {/* Cabecera */}
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold">
                        Pregunta {qIndex + 1}
                      </h3>

                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => moveQuestionUp(qIndex)}>
                          ▲
                        </Button>
                        <Button variant="secondary" onClick={() => moveQuestionDown(qIndex)}>
                          ▼
                        </Button>
                        <Button variant="secondary" onClick={() => duplicateQuestion(qIndex)}>
                          Duplicar
                        </Button>
                        <Button variant="secondary" onClick={() => removeQuestion(qIndex)}>
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
                    <div className="mt-4 space-y-4">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex}>
                          <Input
                            label={"Opción " + (optIndex + 1)}
                            value={opt}
                            onChange={(e) =>
                              updateOption(qIndex, optIndex, e.target.value)
                            }
                          />



                          <label className="mt-1 flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctIndex === optIndex}
                              onChange={() => setCorrect(qIndex, optIndex)}
                            />
                            Respuesta correcta
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón agregar pregunta */}
              <Button className="mt-6" onClick={addQuestion}>
                Añadir pregunta
              </Button>
            </section>
          ) : (
            <section className="p-6 mt-6 border rounded-sm bg-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Palabras del anagrama</h2>
              </div>

              <div className="space-y-6">
                {activity.data.anagrams.map((item, index) => (
                  <div key={index} className="border mb-6 p-5 rounded-sm bg-black-50">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold">Palabra {index + 1}</h3>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => moveAnagramUp(index)}>
                          ▲
                        </Button>
                        <Button variant="secondary" onClick={() => moveAnagramDown(index)}>
                          ▼
                        </Button>
                        <Button variant="secondary" onClick={() => removeAnagram(index)}>
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    <Input
                      label="Palabra objetivo"
                      value={item.word}
                      onChange={(e) => updateAnagramWord(index, e.target.value)}
                    />

                    <div className="mt-4">
                      <Input
                        label="Pista (opcional)"
                        value={item.hint}
                        onChange={(e) => updateAnagramHint(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button className="mt-6" onClick={addAnagram}>
                Añadir palabra
              </Button>
            </section>
          )}

          {/* BOTONES INFERIORES */}
          <div className="flex justify-between items-center pt-4">
            <div />

            <div className="flex gap-3">
              {/* Guardar */}
              <Button onClick={handleSave}>Guardar cambios</Button>
            </div>
          </div>


        </div>
      </main>
    </>

  );
}
