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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
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

export interface CheckPasswordConditions {
  meetsLength: boolean;
  hasDigit: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasSymbol: boolean;
  isValid: boolean;
  passwordMatch?: boolean;
}

export const checkPasswordConditions = (
  password: string,
): CheckPasswordConditions => {
  return {
    meetsLength: password.length >= 8,
    hasDigit: /(?=.*\d)/.test(password),
    hasLowercase: /(?=.*[a-z])/.test(password),
    hasUppercase: /(?=.*[A-Z])/.test(password),
    hasSymbol: /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password),
    isValid:
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(
        password,
      ),
  };
};
