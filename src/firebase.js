import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// SETUP — fill in your Firebase project credentials below.
//
// Step 1 — Create a Firebase project:
//   https://console.firebase.google.com/ → Add project → name it "FitQuest"
//
// Step 2 — Register a Web app inside that project:
//   Project settings → Your apps → </> Web → copy the config object here.
//
// Step 3 — Enable sign-in providers:
//   Authentication → Sign-in method → enable Google and Facebook.
//   For Facebook you also need an App ID + Secret from
//   https://developers.facebook.com/ (create an app, add Facebook Login product).
//
// Step 4 — Add your domain to Authorized domains:
//   Authentication → Settings → Authorized domains → add localhost + your deploy URL.
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Returns true when the config still has placeholder values.
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  !firebaseConfig.apiKey.startsWith("YOUR");

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const signOutUser = () => signOut(auth);
