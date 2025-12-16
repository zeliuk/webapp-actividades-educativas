"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getPublicActivities,
  forkActivity,
} from "@/lib/activitiesService";
import { toast } from "sonner";
import PublicActivityCard from "@/components/PublicActivityCard";

type Activity = {
  id: string;
  title?: string;
  type?: string;
  language?: string;
  ownerName?: string;
};

export default function LibraryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "quiz" | "anagram">("all");
  const [languageFilter, setLanguageFilter] = useState<"all" | "es" | "en">("all");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const filters: { type?: string; language?: string } = {};

        if (typeFilter !== "all") {
          filters.type = typeFilter;
        }

        if (languageFilter !== "all") {
          filters.language = languageFilter;
        }

        const data = await getPublicActivities(filters);
        setActivities(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las actividades públicas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user, typeFilter, languageFilter]);

  async function handleDuplicate(activityId: string) {
    if (!user) return;

    try {
      setDuplicatingId(activityId);
      const newId = await forkActivity(activityId, {
        uid: user.uid,
        displayName: user.displayName || undefined,
      });
      toast.success("Actividad duplicada correctamente");
      router.push(`/dashboard/activities/${newId}`);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo duplicar la actividad.");
    } finally {
      setDuplicatingId(null);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Header title="Biblioteca pública" />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <section className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo
              </label>
              <select
                className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "quiz" | "anagram")
                }
              >
                <option value="all">Todos</option>
                <option value="quiz">Quiz</option>
                <option value="anagram">Anagrama</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Idioma
              </label>
              <select
                className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={languageFilter}
                onChange={(e) =>
                  setLanguageFilter(e.target.value as "all" | "es" | "en")
                }
              >
                <option value="all">Todos</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </select>
            </div>
          </section>

          {loading && <p className="text-gray-600">Cargando actividades...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && activities.length === 0 && (
            <p className="text-gray-600">No hay actividades públicas disponibles.</p>
          )}

          <ul className="space-y-3">
            {activities.map((activity) => (
              <PublicActivityCard
                key={activity.id}
                activity={activity}
                previewHref={`/a/${activity.id}`}
                duplicating={duplicatingId === activity.id}
                onDuplicate={() => handleDuplicate(activity.id)}
              />
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
