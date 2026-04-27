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

const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || "premium";

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

export async function configureRevenueCat(appUserId?: string | null) {
  const apiKey = revenueCatApiKey();

  if (!apiKey) {
    return false;
  }

  if (!configured) {
    Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined
    });
    configured = true;
    activeAppUserId = appUserId || null;
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
    return true;
  }

  if (appUserId && activeAppUserId !== appUserId) {
    await Purchases.logIn(appUserId);
    activeAppUserId = appUserId;
  }

  return true;
}

export async function getRevenueCatOffering(appUserId?: string | null): Promise<PurchasesOffering | null> {
  const ready = await configureRevenueCat(appUserId);

  if (!ready) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
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

  return Purchases.getCustomerInfo();
}

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

const activePremiumEntitlement = (customerInfo: CustomerInfo): PurchasesEntitlementInfo | null =>
  customerInfo.entitlements.active[ENTITLEMENT_ID] || null;

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
