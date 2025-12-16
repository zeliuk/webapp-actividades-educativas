"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Crear actividad
export async function createActivity(activity: any) {
  const ref = collection(db, "activities");
  const resp = await addDoc(ref, {
    ...activity,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return resp; // resp.id es el ID generado
}

// Obtener actividades del usuario
export async function getUserActivities(userId: string) {
  const ref = collection(db, "activities");
  const q = query(ref, where("ownerId", "==", userId));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// Obtener actividad por ID
export async function getActivityById(id: string) {
  const ref = doc(db, "activities", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

// Obtener actividades públicas
export async function getPublicActivities(filters?: {
  type?: string;
  language?: string;
}) {
  const ref = collection(db, "activities");
  const constraints: any[] = [where("isPublic", "==", true)];

  if (filters?.type) {
    constraints.push(where("type", "==", filters.type));
  }

  if (filters?.language) {
    constraints.push(where("language", "==", filters.language));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(ref, ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// Actualizar actividad
export async function updateActivity(id: string, data: any) {
  const ref = doc(db, "activities", id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Eliminar actividad
export async function deleteActivity(id: string) {
  const ref = doc(db, "activities", id);
  return await deleteDoc(ref);
}

// Duplicar actividad pública
export async function forkActivity(
  activityId: string,
  currentUser: { uid: string; displayName?: string }
) {
  if (!currentUser?.uid) {
    throw new Error("Usuario no autenticado");
  }

  const ref = doc(db, "activities", activityId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Actividad no encontrada");
  }

  const data = snap.data();

  if (!data.isPublic) {
    throw new Error("No puedes duplicar una actividad privada");
  }

  const clonedData = JSON.parse(JSON.stringify(data.data ?? {}));

  const newActivity = {
    title: data.title,
    type: data.type ?? data.template,
    template: data.template ?? data.type,
    language: data.language,
    data: clonedData,
    ownerId: currentUser.uid,
    ownerName: currentUser.displayName || data.ownerName,
    isPublic: false,
    forkedFrom: activityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const newRef = await addDoc(collection(db, "activities"), newActivity);
  return newRef.id;
}
