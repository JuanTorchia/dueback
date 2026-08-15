"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing public Firebase configuration: ${name}`);
  return value;
}

export async function anonymousIdToken(): Promise<string> {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: required(
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          ),
          authDomain: required(
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
          ),
          projectId: required(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
          ),
          appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID)
        });
  const auth = getAuth(app);
  const credential = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  return credential.user.getIdToken();
}
