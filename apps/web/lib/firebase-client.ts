"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

interface FirebasePublicConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}
let configRequest: Promise<FirebasePublicConfig> | undefined;

async function publicConfig(): Promise<FirebasePublicConfig> {
  configRequest ??= fetch("/api/config/firebase").then(async (response) => {
    if (!response.ok) throw new Error("PUBLIC_FIREBASE_CONFIG_UNAVAILABLE");
    return (await response.json()) as FirebasePublicConfig;
  });
  return configRequest;
}

export async function anonymousIdToken(): Promise<string> {
  const config = await publicConfig();
  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const credential = auth.currentUser ? { user: auth.currentUser } : await signInAnonymously(auth);
  return credential.user.getIdToken();
}
