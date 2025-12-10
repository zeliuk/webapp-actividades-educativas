"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActivityById } from "@/lib/activitiesService";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

export default function ActivityPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);

  // Nombre del alumno
  const [studentName, setStudentName] = useState("");
  const [confirmedName, setConfirmedName] = useState(false);

  // Respuestas del alumno
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // Cargar actividad
  useEffect(() => {
    async function load() {
      const result = (await getActivityById(id)) as any;

      // SOLO comprobamos si existe, NO si es pública
      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/");
        return;
      }

      setActivity({
        id: result.id,
        title: result.title,
        language: result.language ?? "es",
        isPublic: result.isPublic ?? false, // este campo ya no afecta acceso
        data: {
          questions: Array.isArray(result.data?.questions)
            ? result.data.questions
            : [],
        },
      });

      setAnswers(
        Array(result.data?.questions?.length ?? 0).fill(null)
      );
    }

    load();
  }, [id, router]);


  // Seleccionar una respuesta
  function selectAnswer(qIndex: number, optIndex: number) {
    if (submitted) return; // No permitir cambiar después de enviar
    setAnswers((prev) => {
      const copy = [...prev];
      copy[qIndex] = optIndex;
      return copy;
    });
  }

  // Guardar resultado en Firestore
  async function saveAttempt(correctCount: number) {
    if (!studentName.trim() || !activity) return;

    const attempt = {
      name: studentName.trim(),
      answers: answers,
      correct: correctCount,
      total: activity.data.questions.length,
      percentage: Math.round(
        (correctCount / activity.data.questions.length) * 100
      ),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(
        collection(db, "activities", activity.id, "attempts"),
        attempt
      );
    } catch (err) {
      console.error(err);
      toast.error("Error guardando resultados");
    }
  }

  // Enviar actividad
  function submitAnswers() {
    if (!activity) return;

    let correct = 0;
    activity.data.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });

    setScore(correct);
    setSubmitted(true);
    saveAttempt(correct);
  }

  // PANTALLA 1 — Pedir nombre
  if (!confirmedName) {
    return (
      <>
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <AuthCard title="Antes de comenzar">

              <div className="space-y-4">
                <Input
                  label="Introduce tu nombre para continuar:"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />



                <Button
                  full
                  onClick={() => {
                    if (!studentName.trim()) {
                      toast.error("Escribe tu nombre");
                      return;
                    }
                    setConfirmedName(true);
                  }}
                >
                  Empezar actividad
                </Button>
              </div>
            </AuthCard>
          </div>
        </main>
      </>
    );
  }

  if (!activity) return <p className="p-8">Cargando...</p>;

  // PANTALLA 2 — Actividad interactiva
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <p className="text-sm text-gray-500 mb-4">
          Alumno: <strong>{studentName}</strong>
        </p>

        {/* LISTA DE PREGUNTAS INTERACTIVA */}
        {activity.data.questions.map((q, i) => (
          <div key={i} className="border p-4 rounded-lg mb-4  bg-white">
            <h3 className="font-semibold mb-2">Pregunta {i + 1}</h3>
            <p className="mb-3">{q.question}</p>

            <ul className="space-y-2">
              {q.options.map((opt, j) => {
                const isSelected = answers[i] === j;
                const isCorrect = submitted && j === q.correctIndex;
                const isWrong =
                  submitted && isSelected && j !== q.correctIndex;

                return (
                  <li
                    key={j}
                    onClick={() => selectAnswer(i, j)}
                    className={`
                      p-2 border rounded-lg cursor-pointer
                      transition
                      ${isSelected && !submitted ? "bg-blue-100 border-blue-500" : ""}
                      ${isCorrect ? "bg-green-200 border-green-600" : ""}
                      ${isWrong ? "bg-red-200 border-red-600" : ""}
                    `}
                  >
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* BOTÓN PARA ENVIAR LA ACTIVIDAD */}
        {!submitted ? (
          <Button full onClick={submitAnswers}>
            Enviar respuestas
          </Button>
        ) : (
          <div className="text-center mt-6">
            <h2 className="text-xl font-bold">
              Resultado: {score} / {activity.data.questions.length}
            </h2>

            <p className="text-gray-600 mt-2">
              {(() => {
                const safeScore = score ?? 0;

                if (safeScore === activity.data.questions.length)
                  return "¡Perfecto! 🎉";

                if (safeScore >= activity.data.questions.length / 2)
                  return "¡Buen trabajo! 👍";

                return "Sigue practicando 💪";
              })()}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
