import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Firebase configuration
// Get these values from your Firebase Console -> Project Settings -> General
const firebaseConfig = {
    apiKey: "AIzaSyAtV8F0rsD4V7rSxAmhR2QjK6I8Oim5YfY",
    authDomain: "fiverr-51e0e.firebaseapp.com",
    projectId: "fiverr-51e0e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

export const getUserLogout = () => {
  signOut(auth);
};

