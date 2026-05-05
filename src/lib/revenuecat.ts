import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import type { CustomerInfo, PurchasesEntitlementInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";

import { UserProfile } from "../types";

export type PremiumPlanKey = NonNullable<UserProfile["premiumPlan"]>;

export interface PremiumStatus {
  isPremium: boolean;
  premiumPlan: UserProfile["premiumPlan"];
  premiumExpiresAt: string | null;
  managementUrl: string | null;
}

// Allow several historically-used entitlement lookup keys to match.
// RevenueCat dashboard currently uses "TaskAgent Pro" (with space). The
// env override is the source of truth, but we also fall back to known
// historical aliases so a config drift between Codemagic env and the
// RevenueCat project cannot silently break premium activation.
const PRIMARY_ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "TaskAgent Pro";
const ENTITLEMENT_ID = PRIMARY_ENTITLEMENT_ID;
const ENTITLEMENT_LOOKUP_KEYS = Array.from(
  new Set([PRIMARY_ENTITLEMENT_ID, "TaskAgent Pro", "premium", "Premium", "pro", "Pro"])
);

const revenueCatApiKey = () => {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  }

  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  }

  return undefined;
};

let configured = false;
let activeAppUserId: string | null = null;

export const isRevenueCatConfiguredForPlatform = () => Boolean(revenueCatApiKey());

// Apple reviewers do not wait 15 seconds. Tighten the upper bound so a
// silent SDK hang surfaces as a retryable error well within the patience
// window of an automated review pass on iPad Air M3 / iPadOS 26.
const NETWORK_TIMEOUT_MS = 8_000;
const CONFIGURE_TIMEOUT_MS = 8_000;
const LOG_LEVEL_TIMEOUT_MS = 2_000;

class RevenueCatTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} did not complete in ${ms}ms`);
    this.name = "RevenueCatTimeoutError";
  }
}

const withTimeout = <T>(promise: Promise<T>, label: string, ms: number = NETWORK_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new RevenueCatTimeoutError(label, ms)), ms);
    })
  ]);
};

// `Purchases.configure` is documented as synchronous, but on real devices the
// native module bootstraps StoreKit 2 lazily. Wrapping the entire configure
// flow (sync configure call + log-level await + optional logIn) in a single
// timeout guarantees the rest of the app never blocks on it.
const configureInternal = async (apiKey: string, appUserId: string | null) => {
  if (!configured) {
    try {
      Purchases.configure({
        apiKey,
        appUserID: appUserId || undefined
      });
    } catch (cause) {
      // A sync throw at configure time would otherwise bubble into the
      // paywall as an unhandled rejection and freeze the loading state.
      console.warn("Purchases.configure threw synchronously.", cause);
      return false;
    }

    configured = true;
    activeAppUserId = appUserId;

    // setLogLevel returning a Promise that never resolves is the most likely
    // cause of the May 5 "infinite spinner" report. Treat it as best-effort.
    try {
      await withTimeout(
        Promise.resolve(Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.INFO)),
        "Purchases.setLogLevel",
        LOG_LEVEL_TIMEOUT_MS
      );
    } catch (cause) {
      console.warn("Purchases.setLogLevel did not complete; continuing.", cause);
    }

    return true;
  }

  if (appUserId && activeAppUserId !== appUserId) {
    try {
      await withTimeout(Purchases.logIn(appUserId), "Purchases.logIn");
      activeAppUserId = appUserId;
    } catch (cause) {
      console.warn("RevenueCat logIn failed; continuing with existing user.", cause);
    }
  }

  return true;
};

export async function configureRevenueCat(appUserId?: string | null) {
  const apiKey = revenueCatApiKey();

  if (!apiKey) {
    return false;
  }

  try {
    return await withTimeout(
      configureInternal(apiKey, appUserId || null),
      "configureRevenueCat",
      CONFIGURE_TIMEOUT_MS
    );
  } catch (cause) {
    console.warn("configureRevenueCat timed out or threw; continuing without configure.", cause);
    return false;
  }
}

export async function getRevenueCatOffering(appUserId?: string | null): Promise<PurchasesOffering | null> {
  const ready = await configureRevenueCat(appUserId);

  if (!ready) {
    return null;
  }

  const offerings = await withTimeout(Purchases.getOfferings(), "Purchases.getOfferings");
  if (offerings.current) {
    return offerings.current;
  }

  return (
    Object.values(offerings.all).find(
      (offering) => Boolean(offering.monthly || offering.annual || offering.availablePackages.length)
    ) || null
  );
}

export async function getRevenueCatCustomerInfo(appUserId?: string | null) {
  const ready = await configureRevenueCat(appUserId);

  if (!ready) {
    return null;
  }

  return withTimeout(Purchases.getCustomerInfo(), "Purchases.getCustomerInfo");
}

export const isRevenueCatTimeoutError = (cause: unknown): cause is RevenueCatTimeoutError =>
  cause instanceof RevenueCatTimeoutError;

export async function purchaseRevenueCatPackage(appUserId: string, premiumPackage: PurchasesPackage) {
  const ready = await configureRevenueCat(appUserId);

  if (!ready) {
    throw new Error("RevenueCat is not configured for this platform.");
  }

  return Purchases.purchasePackage(premiumPackage);
}

export async function restoreRevenueCatPurchases(appUserId: string) {
  const ready = await configureRevenueCat(appUserId);

  if (!ready) {
    throw new Error("RevenueCat is not configured for this platform.");
  }

  return Purchases.restorePurchases();
}

export const isRevenueCatPurchaseCancelled = (cause: unknown) => {
  if (!cause || typeof cause !== "object") {
    return false;
  }

  const code = "code" in cause ? cause.code : null;
  return code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
};

export const planForPackage = (premiumPackage: PurchasesPackage): PremiumPlanKey | null => {
  if (premiumPackage.packageType === Purchases.PACKAGE_TYPE.MONTHLY) {
    return "monthly";
  }

  if (premiumPackage.packageType === Purchases.PACKAGE_TYPE.ANNUAL) {
    return "yearly";
  }

  return planForProductIdentifier(premiumPackage.product.identifier);
};

const planForProductIdentifier = (productIdentifier: string | null | undefined): PremiumPlanKey | null => {
  const value = productIdentifier?.toLocaleLowerCase("en-US") || "";

  if (/(year|annual|yearly|yillik|p1y)/.test(value)) {
    return "yearly";
  }

  if (/(month|monthly|aylik|p1m)/.test(value)) {
    return "monthly";
  }

  return null;
};

const activePremiumEntitlement = (customerInfo: CustomerInfo): PurchasesEntitlementInfo | null => {
  for (const key of ENTITLEMENT_LOOKUP_KEYS) {
    const found = customerInfo.entitlements.active[key];
    if (found) {
      return found;
    }
  }
  return null;
};

export function premiumStatusFromCustomerInfo(customerInfo: CustomerInfo, fallbackPlan: PremiumPlanKey | null = null): PremiumStatus {
  const entitlement = activePremiumEntitlement(customerInfo);

  if (!entitlement) {
    return {
      isPremium: false,
      premiumPlan: null,
      premiumExpiresAt: null,
      managementUrl: customerInfo.managementURL
    };
  }

  return {
    isPremium: true,
    premiumPlan: fallbackPlan || planForProductIdentifier(entitlement.productIdentifier),
    premiumExpiresAt: entitlement.expirationDate,
    managementUrl: customerInfo.managementURL
  };
}
