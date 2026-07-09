# 06 — Agency-Facing Data Read Models

This refactor should not immediately rename backend tables or delete the existing `Run` spine. Instead, create agency-facing read models that translate backend records into director-facing concepts.

## Principle

Backend primitives may remain machine-facing.

Frontend/read-model primitives should be agency-facing.

```text
Backend: Run, RunEvent, Asset, Draft, SocialFeedback, Reflection, IdentityProposal
Frontend: ProductionJob, CareerEvent, PortfolioShot, SocialPackage, AudienceSignal, CareerDirection
```

## Suggested read models

## 1. TalentCareerSummary

Used on Roster, Director’s Desk, Strategy, and Talent Profile.

```ts
interface TalentCareerSummary {
  talentId: string;
  displayName: string;
  stage: TalentStage;
  agencyPriority: "push" | "develop" | "test" | "pause" | "retire";
  shortPositioning: string | null;
  bestPlatform: string | null;
  momentumScore: number | null;
  audiencePullScore: number | null;
  identityStrengthScore: number | null;
  developmentRisk: "low" | "medium" | "high" | null;
  nextRecommendedMove: string | null;
  pendingDecisionCount: number;
  latestAudienceSignal: string | null;
  updatedAt: string;
}
```

## 2. TalentStage

```ts
type TalentStage =
  | "scouted"
  | "new_face"
  | "development"
  | "working_talent"
  | "core_talent"
  | "star_talent"
  | "at_risk"
  | "paused"
  | "retired";
```

## 3. DirectorDecision

Used on Director’s Desk and Review Desk.

```ts
interface DirectorDecision {
  id: string;
  type:
    | "new_face_approval"
    | "portfolio_review"
    | "social_package_review"
    | "publishing_follow_up"
    | "audience_debrief"
    | "career_direction"
    | "studio_attention";
  talentId: string | null;
  talentName: string | null;
  title: string;
  summary: string;
  recommendation: string | null;
  reason: string[];
  risk: string | null;
  primaryActionLabel: string;
  primaryActionPath: string;
  technicalSource?: {
    runId?: string;
    assetId?: string;
    draftId?: string;
    feedbackId?: string;
    proposalId?: string;
  };
}
```

## 4. CareerEvent

A director-facing timeline event derived from machine records.

```ts
interface CareerEvent {
  id: string;
  talentId: string;
  occurredAt: string;
  category:
    | "birth"
    | "booking"
    | "production"
    | "portfolio"
    | "review"
    | "publishing"
    | "audience"
    | "identity"
    | "strategy";
  title: string;
  body: string;
  outcome: string | null;
  sourceRunId?: string;
  sourceEntityId?: string;
}
```

Example translation:

```text
Machine:
image.analyzed

Career event:
Portfolio candidate reviewed. Identity match was strong and the shot is ready for director review.
```

## 5. Booking

Agency-facing wrapper around activity candidate + content brief + prompt recipe.

```ts
interface Booking {
  id: string;
  talentId: string;
  talentName: string;
  platform: string;
  title: string;
  goal: string;
  creativeDirection: string;
  audienceHypothesis: string | null;
  status:
    | "idea"
    | "brief_ready"
    | "treatment_ready"
    | "in_production"
    | "ready_for_review"
    | "completed"
    | "cancelled";
  sourceActivityCandidateId?: string;
  sourceContentBriefId?: string;
  sourcePromptRecipeId?: string;
  sourceRunId?: string;
}
```

## 6. PortfolioShot

Agency-facing wrapper around ImageAsset + AssetAnalysis.

```ts
interface PortfolioShot {
  id: string;
  talentId: string | null;
  bookingId: string | null;
  imageUrl: string | null;
  status:
    | "candidate"
    | "approved_for_portfolio"
    | "approved_for_publishing"
    | "rejected_identity_drift"
    | "rejected_quality"
    | "archived";
  identityMatchSummary: string | null;
  qualitySummary: string | null;
  platformFit: string[];
  recommendation: string | null;
  risk: string | null;
  technicalSource: {
    assetId: string;
    promptRecipeId?: string | null;
    runId?: string | null;
  };
}
```

## 7. SocialPackage

Agency-facing wrapper around Draft + PlatformVariant + PublishingPackage.

```ts
interface SocialPackage {
  id: string;
  talentId: string;
  talentName: string;
  title: string;
  status:
    | "needs_review"
    | "approved"
    | "package_ready"
    | "live"
    | "needs_audience_response"
    | "closed";
  platforms: string[];
  primaryCaption: string | null;
  disclosureReady: boolean;
  packagePath?: string | null;
  liveUrls: string[];
  nextActionLabel: string;
}
```

## 8. AudienceSignal

Agency-facing wrapper around SocialFeedback.

```ts
interface AudienceSignal {
  id: string;
  talentId: string;
  sourcePostId: string | null;
  platform: string;
  result: "strong" | "promising" | "mixed" | "weak" | "unknown";
  summary: string;
  whatWorked: string[];
  whatFailed: string[];
  commentThemes: string[];
  recommendedNextTest: string | null;
  metrics: {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    profileVisits: number;
    followsGained: number;
  };
}
```

## 9. CareerDirectionProposal

Agency-facing wrapper around IdentityProposal.

```ts
interface CareerDirectionProposal {
  id: string;
  talentId: string;
  kind: "memory" | "canon" | "identity_bible" | "strategy";
  title: string;
  proposal: string;
  rationale: string | null;
  riskLevel: "low" | "medium" | "high";
  sourceAudienceSignalId?: string;
  sourceRunId?: string;
  status: "proposed" | "approved" | "rejected";
}
```

## Where to compute read models

Early phase:

- compute in frontend helper functions from existing API payloads
- avoid database migrations unless necessary

Later phase:

- add `/api/director/desk`
- add `/api/talent-careers`
- add `/api/talent-careers/:id`
- add `/api/bookings`
- add `/api/audience/signals`
- add `/api/strategy/star-board`

## Migration posture

Do not block Phase 1–3 on new backend models.

Start with UI-level mapping. Add API read models when repeated transformations become messy.
