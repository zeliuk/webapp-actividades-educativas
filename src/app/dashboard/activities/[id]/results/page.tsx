"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getActivityById } from "@/lib/activitiesService";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

type Attempt = {
  id: string;
  name: string;
  correct: number;
  total: number;
  percentage: number;
  createdAt: string | null;
  answers: number[];      // 👈 AÑADIDO
};


type Activity = {
  id: string;
  title: string;
  data: {
    questions: any[];
  };
};

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
      const result = (await getActivityById(id)) as any;

      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/dashboard/activities");
        return;
      }

      setActivity({
        id: result.id,
        title: result.title,
        data: {
          questions: result.data.questions ?? [],
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
            answers: d.answers ?? [],   // 👈 AÑADIDO
        };
        });


      setAttempts(data);
      setLoading(false);
    }

    load();
  }, [id, router]);

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!activity) return null;

  return (
    <main className="p-6">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold mb-6">
          Resultados — {activity.title}
        </h1>

        <AuthCard title="Intentos de los alumnos">

          <Button
            variant="secondary"
            className="mb-6"
            onClick={() => router.push(`/dashboard/activities/${id}`)}
          >
            Volver al editor
          </Button>

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
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold">Estadísticas por pregunta</h2>

            {activity.data.questions.map((q, index) => {
                let total = attempts.length;
                let correct = attempts.filter(
                (a) => a.answers && a.answers[index] === q.correctIndex
                ).length;

                let percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

                return (
                <div key={index} className="border p-4 rounded-lg">
                    <h3 className="font-semibold">
                    Pregunta {index + 1}: {q.question}
                    </h3>

                    <p className="mt-2 text-gray-700">
                    {correct} de {total} alumnos respondieron bien —{" "}
                    <strong>{percentage}%</strong>
                    </p>

                    <div
                    className={`mt-2 h-3 rounded-full ${
                        percentage >= 60 ? "bg-green-400" : "bg-red-400"
                    }`}
                    style={{ width: `${percentage}%`, transition: "0.4s" }}
                    ></div>
                </div>
                );
            })}
          </div>

        </AuthCard>
      </section>
    </main>
  );
}