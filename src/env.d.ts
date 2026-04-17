export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_FIREBASE_API_KEY?: string;
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
      EXPO_PUBLIC_FIREBASE_APP_ID?: string;
      EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
      EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
      EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?: string;
      EXPO_PUBLIC_BYPASS_PREMIUM_PAYWALL?: string;
    }
  }
}

declare module "firebase/auth" {
  import type { Persistence } from "firebase/auth";

  interface ReactNativeAsyncStorage {
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    setItem(key: string, value: string): Promise<void>;
  }

  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
