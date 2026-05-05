import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";

import { clearLegacyPermanentPremiumProfilePatch, permanentPremiumProfilePatch } from "../config/permanentPremium";
import { demoCategories, demoProfile } from "../data/demo";
import { auth, db, isFirebaseConfigured } from "../lib/firebase";
import { AppUser } from "../types";

export type AccountDeletionFailureCode = "missing-password" | "wrong-password" | "recent-login-required" | "firebase-unavailable" | "failed";

export type AccountDeletionResult = { ok: true } | { ok: false; code: AccountDeletionFailureCode };

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  isFirebaseReady: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<AccountDeletionResult>;
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
const ACCOUNT_DELETION_TIMEOUT_MS = 15_000;

class AuthOperationTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} did not complete in ${ms}ms`);
    this.name = "AuthOperationTimeoutError";
  }
}

const withTimeout = <T,>(promise: Promise<T>, label: string, ms: number = ACCOUNT_DELETION_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new AuthOperationTimeoutError(label, ms)), ms);
    })
  ]);
};

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
  premiumExpiresAt: null,
  ...permanentPremiumProfilePatch(user.email)
});

const needsDemoProfileRepair = (value: Record<string, unknown>) =>
  value.email === demoProfile.email || value.fullName === demoProfile.fullName || value.jobTitle === demoProfile.jobTitle;

const needsPermanentPremiumRepair = (user: User, value: Record<string, unknown>) => {
  const patch = permanentPremiumProfilePatch(user.email);
  return Object.entries(patch).some(([key, nextValue]) => value[key] !== nextValue);
};

const needsLegacyPermanentPremiumCleanup = (user: User, value: Record<string, unknown>) => {
  const patch = clearLegacyPermanentPremiumProfilePatch({
    email: user.email,
    isPremium: Boolean(value.isPremium),
    premiumPlan: value.premiumPlan === "monthly" || value.premiumPlan === "yearly" ? value.premiumPlan : null,
    premiumExpiresAt: typeof value.premiumExpiresAt === "string" ? value.premiumExpiresAt : null
  });
  return Object.keys(patch).length > 0;
};

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
    } else {
      const existingData = existing.data();
      const repairPatch: Record<string, unknown> = {
        uid: user.uid,
        ...clearLegacyPermanentPremiumProfilePatch({
          email: user.email,
          isPremium: Boolean(existingData.isPremium),
          premiumPlan: existingData.premiumPlan === "monthly" || existingData.premiumPlan === "yearly" ? existingData.premiumPlan : null,
          premiumExpiresAt: typeof existingData.premiumExpiresAt === "string" ? existingData.premiumExpiresAt : null
        }),
        ...permanentPremiumProfilePatch(user.email)
      };

      if (needsDemoProfileRepair(existingData)) {
        const seed = cleanProfileSeed(user, fullName);
        repairPatch.email = seed.email;
        repairPatch.fullName = seed.fullName || user.email || "";
        repairPatch.avatarUrl = seed.avatarUrl;
        repairPatch.jobTitle = "";
      }

      if (needsDemoProfileRepair(existingData) || needsLegacyPermanentPremiumCleanup(user, existingData) || needsPermanentPremiumRepair(user, existingData)) {
        await setDoc(
          userRef,
          {
            ...repairPatch,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    }
  } catch (cause) {
    if (isFirestoreOfflineError(cause)) {
      console.warn("Firestore profile bootstrap skipped because the client is offline.");
      return;
    }

    console.warn("Firestore profile bootstrap failed.", cause);
  }
}

async function deleteCollectionDocuments(uid: string, collectionName: "categories" | "tasks") {
  const firestore = db;

  if (!firestore) {
    return;
  }

  const snapshot = await getDocs(collection(firestore, "users", uid, collectionName));
  let batch = writeBatch(firestore);
  let operationCount = 0;

  for (const item of snapshot.docs) {
    batch.delete(item.ref);
    operationCount += 1;

    if (operationCount === 450) {
      await batch.commit();
      batch = writeBatch(firestore);
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
}

async function deleteFirestoreAccountData(uid: string) {
  const firestore = db;

  if (!firestore) {
    return;
  }

  await deleteCollectionDocuments(uid, "tasks");
  await deleteCollectionDocuments(uid, "categories");

  const batch = writeBatch(firestore);
  batch.delete(doc(firestore, "users", uid));
  await batch.commit();
}

const accountDeletionFailureCode = (cause: unknown): AccountDeletionFailureCode => {
  if (!(cause instanceof FirebaseError)) {
    return "failed";
  }

  if (cause.code === "auth/wrong-password" || cause.code === "auth/invalid-credential") {
    return "wrong-password";
  }

  if (cause.code === "auth/missing-password") {
    return "missing-password";
  }

  if (cause.code === "auth/requires-recent-login") {
    return "recent-login-required";
  }

  return "failed";
};

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
      deleteAccount: async (password) => {
        setError(null);

        if (!auth || !db) {
          return { ok: false, code: "firebase-unavailable" };
        }

        const currentUser = auth.currentUser;

        if (!currentUser?.email) {
          return { ok: false, code: "failed" };
        }

        if (!password.trim()) {
          return { ok: false, code: "missing-password" };
        }

        try {
          const credential = EmailAuthProvider.credential(currentUser.email, password);
          await withTimeout(
            reauthenticateWithCredential(currentUser, credential),
            "reauthenticateWithCredential"
          );
          await withTimeout(
            deleteFirestoreAccountData(currentUser.uid),
            "deleteFirestoreAccountData"
          );
          await withTimeout(deleteUser(currentUser), "deleteUser");
          setUser(null);
          return { ok: true };
        } catch (cause) {
          console.warn("Account deletion failed.", cause);
          return { ok: false, code: accountDeletionFailureCode(cause) };
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
