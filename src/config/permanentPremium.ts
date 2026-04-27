import type { UserProfile } from "../types";

const DEVELOPMENT_PERMANENT_PREMIUM_EMAILS = ["fnbmtn@hotmail.com"];

export const PERMANENT_PREMIUM_EMAILS = __DEV__ ? DEVELOPMENT_PERMANENT_PREMIUM_EMAILS : [];

const normalizeEmail = (email?: string | null) => email?.trim().toLocaleLowerCase("en-US") || "";

export const isPermanentPremiumEmail = (email?: string | null) =>
  Boolean(email && PERMANENT_PREMIUM_EMAILS.includes(normalizeEmail(email)));

export const permanentPremiumProfilePatch = (email?: string | null): Partial<UserProfile> =>
  isPermanentPremiumEmail(email)
    ? {
        isPremium: true,
        premiumPlan: "yearly",
        premiumExpiresAt: null
      }
    : {};

export const clearLegacyPermanentPremiumProfilePatch = (value: {
  email?: string | null;
  isPremium?: boolean | null;
  premiumPlan?: UserProfile["premiumPlan"];
  premiumExpiresAt?: string | null;
}): Partial<UserProfile> => {
  // In production, PERMANENT_PREMIUM_EMAILS is empty so no legacy cleanup needed.
  if (
    PERMANENT_PREMIUM_EMAILS.length === 0 ||
    __DEV__ ||
    !PERMANENT_PREMIUM_EMAILS.includes(normalizeEmail(value.email)) ||
    !value.isPremium ||
    value.premiumExpiresAt
  ) {
    return {};
  }

  return {
    isPremium: false,
    premiumPlan: null,
    premiumExpiresAt: null
  };
};
