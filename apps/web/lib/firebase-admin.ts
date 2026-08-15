import { applicationDefault, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: applicationDefault(),
        ...(process.env.GOOGLE_CLOUD_PROJECT ? { projectId: process.env.GOOGLE_CLOUD_PROJECT } : {})
      });

export const adminAuth = getAuth(app);
export const firestore = getFirestore(app);
