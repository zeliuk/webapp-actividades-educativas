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