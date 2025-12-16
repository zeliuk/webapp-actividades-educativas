import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Activity = {
  id: string;
  title?: string;
  type?: string;
  language?: string;
  ownerName?: string;
};

type Props = {
  activity: Activity;
  previewHref: string;
  duplicating?: boolean;
  onDuplicate: () => void;
};

export default function PublicActivityCard({
  activity,
  previewHref,
  duplicating,
  onDuplicate,
}: Props) {
  return (
    <li className="p-4 border rounded-sm bg-white flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm uppercase text-gray-500">
          {activity.type} · {activity.language}
        </span>
        <h3 className="text-lg font-semibold">{activity.title}</h3>
        {activity.ownerName && (
          <span className="text-sm text-gray-500">
            Autor: {activity.ownerName}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={previewHref} target="_blank" rel="noreferrer">
          <Button variant="secondary">Vista previa</Button>
        </Link>
        <Button onClick={onDuplicate} disabled={duplicating}>
          {duplicating ? "Duplicando..." : "Duplicar"}
        </Button>
      </div>
    </li>
  );
}
