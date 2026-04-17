import type { UserProfile } from "../types";

export const PERMANENT_PREMIUM_EMAILS = ["fnbmtn@hotmail.com"];

export const isPermanentPremiumEmail = (email?: string | null) =>
  Boolean(email && PERMANENT_PREMIUM_EMAILS.includes(email.trim().toLocaleLowerCase("en-US")));

export const permanentPremiumProfilePatch = (email?: string | null): Partial<UserProfile> =>
  isPermanentPremiumEmail(email)
    ? {
        isPremium: true,
        premiumPlan: "yearly",
        premiumExpiresAt: null
      }
    : {};
