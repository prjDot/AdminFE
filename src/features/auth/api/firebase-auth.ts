import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  };
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey && config.authDomain && config.projectId && config.appId
  );
}

function getFirebaseAuth() {
  const config = getFirebaseConfig();

  if (!isFirebaseConfigured()) {
    throw new Error("FIREBASE_CONFIG_MISSING");
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  return getAuth(app);
}

export async function getGoogleFirebaseIdToken() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken(true);
}

export async function signOutFirebase() {
  if (!isFirebaseConfigured()) {
    return;
  }

  await signOut(getFirebaseAuth());
}
