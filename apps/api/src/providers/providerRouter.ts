import { ProviderGenerationError } from "@virtual-agency/providers";

export type ContentTier = "sfw_standard" | "sfw_sensitive" | "mature_adult" | "blocked_or_uncertain";
export type ProviderOverride = "auto" | "openai" | "comfyui-cloud" | "hermes" | "wavespeed" | "mock";

export interface RouteDecision {
  tier: ContentTier;
  routeReason: string;
  providers: ProviderOverride[];
  blocked: boolean;
  requiresReview: boolean;
  overrideApplied: boolean;
}

const blockedTerms = [
  "underage",
  "minor",
  "child sexual",
  "nonconsensual",
  "non-consensual",
  "sexual assault",
  "revenge porn",
  "csam",
  "illegal sexual"
];

const matureTerms = [
  "nude",
  "nudity",
  "erotic",
  "sexual",
  "adult",
  "boudoir",
  "lingerie",
  "topless",
  "explicit",
  "fetish"
];

const sensitiveTerms = ["bikini", "swimsuit", "intimate", "suggestive", "body-focused", "horror", "blood"];

export function classifyContentTier(prompt: string, override?: string | null): { tier: ContentTier; reason: string } {
  const normalized = prompt.toLowerCase();
  if (blockedTerms.some((term) => normalized.includes(term))) {
    return { tier: "blocked_or_uncertain", reason: "Prompt matched blocked or legally uncertain content terms." };
  }
  if (override && ["sfw_standard", "sfw_sensitive", "mature_adult", "blocked_or_uncertain"].includes(override)) {
    return { tier: override as ContentTier, reason: `Operator selected ${override}.` };
  }
  if (matureTerms.some((term) => normalized.includes(term))) {
    return { tier: "mature_adult", reason: "Prompt matched legal adult-oriented content terms." };
  }
  if (sensitiveTerms.some((term) => normalized.includes(term))) {
    return { tier: "sfw_sensitive", reason: "Prompt matched SFW-sensitive content terms." };
  }
  return { tier: "sfw_standard", reason: "Prompt matched standard SFW routing." };
}

export function routeForPrompt(input: {
  prompt: string;
  providerOverride?: string | null;
  overrideReason?: string | null;
  contentTierOverride?: string | null;
  providerAvailability?: Partial<Record<Exclude<ProviderOverride, "auto">, boolean>>;
}): RouteDecision {
  const providerOverride = (input.providerOverride ?? "auto") as ProviderOverride;
  const classification = classifyContentTier(input.prompt, input.contentTierOverride);
  if (classification.tier === "blocked_or_uncertain") {
    return {
      tier: classification.tier,
      routeReason: classification.reason,
      providers: [],
      blocked: true,
      requiresReview: true,
      overrideApplied: providerOverride !== "auto"
    };
  }
  if (providerOverride !== "auto") {
    if (!input.overrideReason?.trim()) {
      throw new Error("Provider override requires an overrideReason.");
    }
    return {
      tier: classification.tier,
      routeReason: input.overrideReason,
      providers: [providerOverride],
      blocked: false,
      requiresReview: classification.tier === "mature_adult",
      overrideApplied: true
    };
  }
  if (classification.tier === "mature_adult") {
    if (input.providerAvailability?.["comfyui-cloud"] === false) {
      return {
        tier: classification.tier,
        routeReason: `${classification.reason} ComfyUI Cloud is not configured, so the run requires provider setup review.`,
        providers: [],
        blocked: true,
        requiresReview: true,
        overrideApplied: false
      };
    }
    return {
      tier: classification.tier,
      routeReason: classification.reason,
      providers: ["comfyui-cloud"],
      blocked: false,
      requiresReview: true,
      overrideApplied: false
    };
  }
  if (input.providerAvailability?.openai === false) {
    if (input.providerAvailability["comfyui-cloud"] === false) {
      return {
        tier: classification.tier,
        routeReason: `${classification.reason} No configured SFW image provider is available.`,
        providers: [],
        blocked: true,
        requiresReview: true,
        overrideApplied: false
      };
    }
    return {
      tier: classification.tier,
      routeReason: `${classification.reason} OpenAI image generation is not configured, so ComfyUI Cloud is the first available route.`,
      providers: ["comfyui-cloud"],
      blocked: false,
      requiresReview: false,
      overrideApplied: false
    };
  }
  if (input.providerAvailability?.["comfyui-cloud"] === true) {
    return {
      tier: classification.tier,
      routeReason: `${classification.reason} ComfyUI Cloud is configured, so identity-locked character generation is the first route.`,
      providers: ["comfyui-cloud", "openai"],
      blocked: false,
      requiresReview: false,
      overrideApplied: false
    };
  }
  return {
    tier: classification.tier,
    routeReason: classification.reason,
    providers: ["openai", "comfyui-cloud"],
    blocked: false,
    requiresReview: false,
    overrideApplied: false
  };
}

export function fallbackReason(error: unknown) {
  if (error instanceof ProviderGenerationError && error.details.fallbackEligible) {
    return error.message;
  }
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  if (normalized.includes("moderation") || normalized.includes("policy") || normalized.includes("safety") || normalized.includes("refus")) {
    return message;
  }
  if (normalized.includes("429") || normalized.includes("timeout") || normalized.includes("rate limit")) {
    return message;
  }
  return null;
}
