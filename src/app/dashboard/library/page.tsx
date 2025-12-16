"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { getPublicActivities, forkActivity } from "@/lib/activitiesService";
import { toast } from "sonner";
import PublicActivityCard from "@/components/PublicActivityCard";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Activity = {
  id: string;
  title?: string;
  type?: string;
  language?: string;
  name?: string;
  ownerName?: string;
  ownerId?: string;
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

        const data = (await getPublicActivities(filters)) as Activity[];
        const filtered = user
          ? data.filter((activity) => activity.ownerId !== user.uid)
          : data;

        const ownerIds = Array.from(
          new Set(
            filtered
              .map((activity) => activity.ownerId)
              .filter((id): id is string => Boolean(id))
          )
        );

        const ownersMap: Record<string, string> = {};
        await Promise.all(
          ownerIds.map(async (ownerId) => {
            try {
              const userRef = doc(db, "users", ownerId);
              const snapshot = await getDoc(userRef);
              if (snapshot.exists()) {
                const userData = snapshot.data() as { name?: string };
                ownersMap[ownerId] = userData?.name?.trim() || "Anónimo";
              } else {
                ownersMap[ownerId] = "Anónimo";
              }
            } catch (error) {
              console.error("Error obteniendo autor", error);
              ownersMap[ownerId] = "Anónimo";
            }
          })
        );

        const withOwners = filtered.map((activity) => ({
          ...activity,
          ownerName: activity.ownerId
            ? ownersMap[activity.ownerId] || "Anónimo"
            : "Anónimo",
        }));

        setActivities(withOwners);
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
            <div className="w-full sm:w-64">
              <Select
                label="Tipo"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "quiz" | "anagram")
                }
              >
                <option value="all">Todos</option>
                <option value="quiz">Quiz</option>
                <option value="anagram">Anagrama</option>
              </Select>
            </div>

            <div className="w-full sm:w-64">
              <Select
                label="Idioma"
                value={languageFilter}
                onChange={(e) =>
                  setLanguageFilter(e.target.value as "all" | "es" | "en")
                }
              >
                <option value="all">Todos</option>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </Select>
            </div>

            <div className="w-full sm:w-auto flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setTypeFilter("all");
                  setLanguageFilter("all");
                }}
              >
                Reiniciar filtros
              </Button>
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
                previewHref={`/dashboard/activities/${activity.id}/preview`}
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
