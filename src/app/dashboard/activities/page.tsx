"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserActivities, deleteActivity } from "@/lib/activitiesService";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { toast } from "sonner";
import Header from "@/components/Header";

type Activity = {
  id: string;
  title?: string;
  type?: string;
  isPublic?: boolean;
  data?: any;
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Si aún no hay usuario, no cargues nada
    if (!user) return;

    // TypeScript ahora sabe 100% que user no es null
    const uid = user.uid;

    async function load() {
      const data = await getUserActivities(uid);
      setActivities(data);
    }

    load();
  }, [user]);

  async function handleDelete(id: string) {
    await deleteActivity(id);
    toast.success("Actividad eliminada");
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <Header title="Mis actividades" />
      <main className="flex-1 pt-35">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">


          <ul className="space-y-3">
            {activities.map((a) => (
              <li
                key={a.id}
                className="p-4 border rounded-sm flex justify-between items-center bg-white"
              >
                <div>
                  <h2 className="font-semibold">{a.title}</h2>
                  <p className="text-sm text-gray-500">{a.type}</p>
                </div>

                <div className="space-x-2">
                  {/* Resultados */}
                  <Link href={`/dashboard/activities/${a.id}/results`}>
                    <Button>Resultados</Button>
                  </Link>

                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const url = `${window.location.origin}/a/${a.id}`;
                      await navigator.clipboard.writeText(url);
                      toast.success("Enlace copiado al portapapeles");
                    }}
                  >
                    Copiar enlace para alumnos
                  </Button>

                  <Link href={`/dashboard/activities/${a.id}/preview`}>
                    <Button variant="secondary">Preview</Button>
                  </Link>

                  {/* Editar */}
                  <Link href={`/dashboard/activities/${a.id}`}>
                    <Button variant="secondary">Editar</Button>
                  </Link>

                  {/* Eliminar */}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      toast("¿Eliminar esta actividad?", {
                        action: {
                          label: "Sí",
                          onClick: () => handleDelete(a.id),
                        },
                      })
                    }
                  >
                    Eliminar
                  </Button>

                </div>

              </li>
            ))}

            {activities.length === 0 && (
              <p className="text-gray-600">Aún no has creado ninguna actividad.</p>
            )}
          </ul>

        </div>
      </main>
    </>

  );
}