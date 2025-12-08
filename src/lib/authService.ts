// src/lib/authService.ts
"use client";

import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// -------------------------------
// Crear documento del usuario
// -------------------------------
async function createUserDocument(uid: string, data: any) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data, { merge: true });
}

// -------------------------------
// Registro tradicional con email
// -------------------------------
export async function registerWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  // Crear documento en Firestore
  await createUserDocument(user.uid, {
    email: user.email,
    createdAt: Date.now(),
    preferredLanguage: "es", // por defecto
  });

  return user;
}

// -------------------------------
// Login tradicional con email
// -------------------------------
export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// -------------------------------
// Login / Registro con Google
// -------------------------------
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Comprobar si existe ya el documento
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // usuario nuevo → crear documento
    await createUserDocument(user.uid, {
      email: user.email,
      name: user.displayName ?? "",
      avatar: user.photoURL ?? "",
      createdAt: Date.now(),
      preferredLanguage: "es",
    });
  }

  return user;
}

// -------------------------------
// Logout
// -------------------------------
export async function logoutUser() {
  await signOut(auth);
}
