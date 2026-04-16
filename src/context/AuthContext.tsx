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
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

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
  sendPasswordReset: (email: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toAppUser = (user: User): AppUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  isDemo: false
});

const demoUser: AppUser = {
  uid: demoProfile.uid,
  email: demoProfile.email,
  displayName: demoProfile.fullName,
  photoURL: null,
  isDemo: true
};

const authErrorMessage = (cause: unknown, fallback: string) => {
  if (!(cause instanceof FirebaseError)) {
    return fallback;
  }

  const messages: Record<string, string> = {
    "auth/email-already-in-use": "Bu email adresiyle bir hesap zaten var.",
    "auth/invalid-email": "Geçerli bir email adresi yaz.",
    "auth/invalid-credential": "Email veya şifre hatalı.",
    "auth/missing-password": "Şifre alanı boş bırakılamaz.",
    "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
    "auth/user-not-found": "Bu email adresiyle kayıtlı hesap bulunamadı.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/wrong-password": "Email veya şifre hatalı."
  };

  return messages[cause.code] || fallback;
};

async function createProfileIfNeeded(user: User, fullName?: string) {
  const firestore = db;

  if (!firestore) {
    return;
  }

  const userRef = doc(firestore, "users", user.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      fullName: fullName || user.displayName || "",
      avatarUrl: user.photoURL || "",
      avatarStoragePath: "",
      jobTitle: "",
      language: "tr",
      pushNotifications: true,
      darkMode: false,
      isPremium: false,
      premiumPlan: null,
      premiumExpiresAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await Promise.all(
      demoCategories.map((category) =>
        addDoc(collection(firestore, "users", user.uid, "categories"), {
          name: category.name,
          icon: category.icon,
          color: category.color,
          taskCount: 0,
          createdAt: serverTimestamp()
        })
      )
    );
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
        await createProfileIfNeeded(firebaseUser);
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
          setUser(demoUser);
          return;
        }

        try {
          const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
          await createProfileIfNeeded(credential.user);
        } catch (cause) {
          setError(authErrorMessage(cause, "Giriş yapılamadı."));
          throw cause;
        }
      },
      signUpWithEmail: async (email, password, fullName) => {
        setError(null);

        if (!auth) {
          setUser({ ...demoUser, displayName: fullName || demoUser.displayName });
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
          throw cause;
        }
      },
      sendPasswordReset: async (email) => {
        setError(null);

        if (!auth) {
          setError("Şifre sıfırlama için Firebase anahtarlarını ayarlamalısın.");
          return;
        }

        try {
          await sendPasswordResetEmail(auth, email.trim());
        } catch (cause) {
          setError(authErrorMessage(cause, "Şifre sıfırlama emaili gönderilemedi."));
          throw cause;
        }
      },
      signInDemo: () => {
        setError(null);
        setUser(demoUser);
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
