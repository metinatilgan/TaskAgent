import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { demoCategories, demoProfile } from "../data/demo";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { AppUser } from "../types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  isFirebaseReady: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const displayNameForUser = (user: User) =>
  user.displayName || user.providerData.find((provider) => provider.displayName)?.displayName || null;

const photoUrlForUser = (user: User) => user.photoURL || user.providerData.find((provider) => provider.photoURL)?.photoURL || null;

const toAppUser = (user: User): AppUser => ({
  uid: user.uid,
  email: user.email,
  displayName: displayNameForUser(user),
  photoURL: photoUrlForUser(user),
  isDemo: false
});

const authErrorMessage = (cause: unknown, fallback: string) => {
  if (!(cause instanceof FirebaseError)) {
    return fallback;
  }

  const messages: Record<string, string> = {
    "auth/account-exists-with-different-credential": "Bu email adresi farklı bir giriş yöntemiyle kayıtlı.",
    "auth/email-already-in-use": "Bu email adresiyle bir hesap zaten var.",
    "auth/invalid-email": "Geçerli bir email adresi yaz.",
    "auth/invalid-credential": "Email veya şifre hatalı.",
    "auth/missing-password": "Şifre alanı boş bırakılamaz.",
    "auth/operation-not-allowed": "Bu giriş yöntemi Firebase Console'da etkin değil.",
    "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
    "auth/user-not-found": "Bu email adresiyle kayıtlı hesap bulunamadı.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/wrong-password": "Email veya şifre hatalı."
  };

  return messages[cause.code] || fallback;
};

const firebaseRequiredMessage = "Bu giriş yöntemi için Firebase anahtarları ve ilgili provider etkin olmalı.";

const isFirestoreOfflineError = (cause: unknown) =>
  cause instanceof FirebaseError &&
  (cause.code === "unavailable" || cause.message.toLowerCase().includes("client is offline"));

const cleanProfileSeed = (user: User, fullName?: string) => ({
  uid: user.uid,
  email: user.email || "",
  fullName: fullName || displayNameForUser(user) || "",
  avatarUrl: photoUrlForUser(user) || "",
  avatarStoragePath: "",
  jobTitle: "",
  language: "tr",
  pushNotifications: true,
  isPremium: false,
  premiumPlan: null,
  premiumExpiresAt: null
});

const needsDemoProfileRepair = (value: Record<string, unknown>) =>
  value.email === demoProfile.email || value.fullName === demoProfile.fullName || value.jobTitle === demoProfile.jobTitle;

async function createProfileIfNeeded(user: User, fullName?: string) {
  const firestore = db;

  if (!firestore) {
    return;
  }

  try {
    const userRef = doc(firestore, "users", user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      const seed = cleanProfileSeed(user, fullName);
      await setDoc(userRef, {
        ...seed,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await Promise.all(
        demoCategories.map((category) =>
          setDoc(
            doc(firestore, "users", user.uid, "categories", category.id),
            {
              name: category.name,
              icon: category.icon,
              color: category.color,
              taskCount: 0,
              createdAt: serverTimestamp()
            },
            { merge: true }
          )
        )
      );
    } else if (needsDemoProfileRepair(existing.data())) {
      const seed = cleanProfileSeed(user, fullName);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: seed.email,
          fullName: seed.fullName || user.email || "",
          avatarUrl: seed.avatarUrl,
          jobTitle: "",
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  } catch (cause) {
    if (isFirestoreOfflineError(cause)) {
      console.warn("Firestore profile bootstrap skipped because the client is offline.");
      return;
    }

    console.warn("Firestore profile bootstrap failed.", cause);
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await createProfileIfNeeded(firebaseUser);
        } catch (cause) {
          console.warn("Firebase profile bootstrap failed.", cause);
        }
        setUser(toAppUser(firebaseUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isFirebaseReady: isFirebaseConfigured,
      signInWithEmail: async (email, password) => {
        setError(null);

        if (!auth) {
          setError(firebaseRequiredMessage);
          return;
        }

        try {
          const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
          await createProfileIfNeeded(credential.user);
        } catch (cause) {
          setError(authErrorMessage(cause, "Giriş yapılamadı."));
        }
      },
      signUpWithEmail: async (email, password, fullName) => {
        setError(null);

        if (!auth) {
          setError(firebaseRequiredMessage);
          return;
        }

        try {
          const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          if (fullName) {
            await updateProfile(credential.user, { displayName: fullName });
          }
          await createProfileIfNeeded(credential.user, fullName);
        } catch (cause) {
          setError(authErrorMessage(cause, "Hesap oluşturulamadı."));
        }
      },
      sendPasswordReset: async (email) => {
        setError(null);

        if (!auth) {
          setError("Şifre sıfırlama için Firebase anahtarlarını ayarlamalısın.");
          return false;
        }

        try {
          await sendPasswordResetEmail(auth, email.trim());
          return true;
        } catch (cause) {
          setError(authErrorMessage(cause, "Şifre sıfırlama emaili gönderilemedi."));
          return false;
        }
      },
      signOut: async () => {
        setError(null);
        if (auth && user && !user.isDemo) {
          await firebaseSignOut(auth);
        }
        setUser(null);
      },
      clearError: () => setError(null)
    }),
    [error, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
