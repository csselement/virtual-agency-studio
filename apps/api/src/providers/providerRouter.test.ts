import { describe, expect, it } from "vitest";
import { ProviderGenerationError } from "@virtual-agency/providers";
import { fallbackReason, routeForPrompt } from "./providerRouter";

describe("provider router", () => {
  it("routes standard SFW prompts through OpenAI then Comfy fallback when Comfy is not confirmed ready", () => {
    expect(routeForPrompt({ prompt: "Editorial studio portrait in a blazer." })).toMatchObject({
      tier: "sfw_standard",
      providers: ["openai", "comfyui-cloud"],
      blocked: false,
      requiresReview: false
    });
  });

  it("routes standard SFW prompts through Comfy first when Comfy is ready for identity control", () => {
    expect(
      routeForPrompt({
        prompt: "Editorial studio portrait in a blazer.",
        providerAvailability: { openai: true, "comfyui-cloud": true }
      })
    ).toMatchObject({
      tier: "sfw_standard",
      providers: ["comfyui-cloud", "openai"],
      blocked: false,
      requiresReview: false
    });
  });

  it("skips OpenAI for auto SFW routing when OpenAI is not configured", () => {
    expect(
      routeForPrompt({
        prompt: "Editorial studio portrait in a blazer.",
        providerAvailability: { openai: false, "comfyui-cloud": true }
      })
    ).toMatchObject({
      tier: "sfw_standard",
      providers: ["comfyui-cloud"],
      blocked: false
    });
  });

  it("routes sensitive SFW prompts through Comfy first when Comfy is ready for identity control", () => {
    expect(routeForPrompt({ prompt: "Tasteful swimsuit editorial by a hotel pool.", providerAvailability: { "comfyui-cloud": true } })).toMatchObject({
      tier: "sfw_sensitive",
      providers: ["comfyui-cloud", "openai"],
      blocked: false
    });
  });

  it("routes mature legal prompts directly to Comfy with review required", () => {
    expect(routeForPrompt({ prompt: "Legal adult boudoir portrait for a private editorial set." })).toMatchObject({
      tier: "mature_adult",
      providers: ["comfyui-cloud"],
      requiresReview: true
    });
  });

  it("blocks legally uncertain prompts before provider spend", () => {
    expect(routeForPrompt({ prompt: "underage sexual content", providerOverride: "comfyui-cloud", overrideReason: "do it" })).toMatchObject({
      tier: "blocked_or_uncertain",
      providers: [],
      blocked: true,
      requiresReview: true,
      overrideApplied: true
    });
  });

  it("requires a reason for manual provider override", () => {
    expect(() => routeForPrompt({ prompt: "portrait", providerOverride: "openai" })).toThrow("overrideReason");
  });

  it("identifies OpenAI moderation and rate failures as fallback reasons", () => {
    const moderation = new ProviderGenerationError("OpenAI image generation failed with 400", {
      provider: "openai-image-generation",
      statusCode: 400,
      fallbackEligible: true
    });
    expect(fallbackReason(moderation)).toContain("OpenAI");
    expect(fallbackReason(new Error("rate limit exceeded"))).toBe("rate limit exceeded");
    expect(fallbackReason(new Error("bad workflow"))).toBeNull();
  });
});
