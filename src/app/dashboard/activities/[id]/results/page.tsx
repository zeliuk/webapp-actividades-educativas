"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActivityById } from "@/lib/activitiesService";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
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

type Attempt = {
  id: string;
  name: string;
  correct: number;
  total: number;
  percentage: number;
  createdAt: string | null;
  answers: (number | string | null)[];
  type: ActivityType;
  durationMs: number | null;
};

type Activity = {
  id: string;
  title: string;
  type: ActivityType;
  data: {
    questions: Question[];
    anagrams: AnagramPuzzle[];
  };
};

function normalizeWord(value: string) {
  return value?.toString().replace(/\s+/g, "").toLowerCase();
}

function formatTime(ms: number | null) {
  if (typeof ms !== "number" || Number.isNaN(ms) || ms < 0) {
    return null;
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ActivityResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activity + attempts
  useEffect(() => {
    async function load() {
      const result = (await getActivityById(id)) as Activity | null;

      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/dashboard/activities");
        return;
      }

      const activityType = (result.type ?? "quiz") as ActivityType;

      setActivity({
        id: result.id,
        title: result.title,
        type: activityType,
        data: {
          questions: Array.isArray(result.data?.questions)
            ? (result.data.questions as Question[])
            : [],
          anagrams: Array.isArray(result.data?.anagrams)
            ? (result.data.anagrams as AnagramPuzzle[])
            : [],
        },
      });

      // Load attempts
      const attemptsRef = collection(db, "activities", id, "attempts");
      const q = query(attemptsRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data: Attempt[] = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          correct: d.correct,
          total: d.total,
          percentage: d.percentage,
          createdAt: d.createdAt?.toDate()?.toLocaleString() ?? null,
          answers: d.answers ?? [],
          type: (d.type ?? activityType) as ActivityType,
          durationMs:
            typeof d.durationMs === "number" ? d.durationMs : null,
        };
      });


      setAttempts(data);
      setLoading(false);
    }

    load();
  }, [id, router]);

  if (loading) return <p className="p-8">Cargando...</p>;
  if (!activity) return null;

  const attemptsForCurrentType = attempts.filter(
    (a) => a.type === activity.type
  );
  const totalAttempts = attemptsForCurrentType.length;
  const averageDurationMs =
    totalAttempts === 0
      ? null
      : Math.round(
        attemptsForCurrentType.reduce(
          (sum, attempt) => sum + (attempt.durationMs ?? 0),
          0
        ) / totalAttempts
      );

  return (
    <>
      <Header title={`Resultados - ${activity.title}`} />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* TABLE OF ATTEMPTS */}
          {attempts.length === 0 ? (
            <p className="text-gray-500">Aún no hay intentos.</p>
          ) : (
            <table className="w-full border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Alumno</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Aciertos</th>
                  <th className="p-2 text-left">% Nota</th>
                  <th className="p-2 text-left">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.name}</td>
                    <td className="p-2">{a.createdAt}</td>
                    <td className="p-2">
                      {a.correct}/{a.total}
                    </td>
                    <td className="p-2">{a.percentage}%</td>
                    <td className="p-2">
                      {(() => {
                        const formatted = formatTime(a.durationMs);
                        return formatted ?? "—";
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* QUESTION STATISTICS */}
          <div className="mt-10">
            {activity.type === "quiz" ? (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Estadísticas por pregunta
                </h2>
                {activity.data.questions.map((q, index) => {
                  const total = attemptsForCurrentType.length;
                  const correct = attemptsForCurrentType.filter(
                    (a) =>
                      Array.isArray(a.answers) &&
                      a.answers[index] === q.correctIndex
                  ).length;
                  const percentage =
                    total === 0 ? 0 : Math.round((correct / total) * 100);

                  return (
                    <div key={index} className="border p-4 rounded-lg mb-4">
                      <h3 className="font-semibold">
                        Pregunta {index + 1}: {q.question}
                      </h3>

                      <p className="mt-2 text-gray-700">
                        {correct} de {total} alumnos respondieron bien —{" "}
                        <strong>{percentage}%</strong>
                      </p>

                      <div
                        className={`mt-2 h-3 rounded-full ${percentage >= 60 ? "bg-green-400" : "bg-red-400"
                          }`}
                        style={{ width: `${percentage}%`, transition: "0.4s" }}
                      ></div>
                    </div>
                  );
                })}

                {activity.data.questions.length === 0 && (
                  <p className="text-gray-500">
                    No hay preguntas configuradas todavía.
                  </p>
                )}
              </>
            ) : (
              <div className="border p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Resumen de intentos</h2>
                {totalAttempts === 0 ? (
                  <p className="text-gray-500">
                    Aún no hay intentos registrados para esta actividad.
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700">
                      Cada intento exige resolver todas las palabras, por lo que
                      no se muestran estadísticas por palabra.
                    </p>
                    <p className="text-gray-700 mt-2">
                      Intentos registrados: <strong>{totalAttempts}</strong>
                    </p>
                    {averageDurationMs !== null && (
                      <p className="text-gray-700 mt-1">
                        Tiempo medio en completar la actividad:{" "}
                        <strong>{formatTime(averageDurationMs)}</strong>
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>

  );
}
