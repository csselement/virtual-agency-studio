import type { ComfyWorkflowSummary } from "../db/repositories";

export const contentTiers = ["sfw_standard", "sfw_sensitive", "mature_adult"] as const;

export type ActivatableContentTier = (typeof contentTiers)[number];

export interface ComfyWorkflowInput {
  id?: string;
  name: string;
  workflow: Record<string, unknown>;
  positivePromptNode?: string | null;
  positivePromptInput?: string | null;
  negativePromptNode?: string | null;
  negativePromptInput?: string | null;
  seedNode?: string | null;
  seedInput?: string | null;
  outputNodeIds?: string[];
  defaultForTiers?: string[];
  status?: string;
}

export interface WorkflowValidationResult {
  valid: boolean;
  outputNodeIds: string[];
  error: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "string") {
    const parsed = JSON.parse(value);
    const record = asRecord(parsed);
    if (!record) throw new Error("Workflow JSON must be an object.");
    return record;
  }
  const record = asRecord(value);
  if (!record) throw new Error("Workflow JSON must be an object.");
  return record;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeComfyWorkflowInput(value: Record<string, unknown>): ComfyWorkflowInput {
  return {
    id: typeof value.id === "string" ? value.id : undefined,
    name: String(value.name ?? "").trim(),
    workflow: parseJsonRecord(value.workflow ?? value.workflowJson ?? {}),
    positivePromptNode: typeof value.positivePromptNode === "string" ? value.positivePromptNode.trim() || null : null,
    positivePromptInput: typeof value.positivePromptInput === "string" ? value.positivePromptInput.trim() || null : null,
    negativePromptNode: typeof value.negativePromptNode === "string" ? value.negativePromptNode.trim() || null : null,
    negativePromptInput: typeof value.negativePromptInput === "string" ? value.negativePromptInput.trim() || null : null,
    seedNode: typeof value.seedNode === "string" ? value.seedNode.trim() || null : null,
    seedInput: typeof value.seedInput === "string" ? value.seedInput.trim() || null : null,
    outputNodeIds: stringList(value.outputNodeIds),
    defaultForTiers: stringList(value.defaultForTiers).filter((tier) => contentTiers.includes(tier as ActivatableContentTier)),
    status: typeof value.status === "string" ? value.status : undefined
  };
}

function nodeInputs(workflow: Record<string, unknown>, nodeId?: string | null): Record<string, unknown> | null {
  if (!nodeId) return null;
  const node = asRecord(workflow[nodeId]);
  return asRecord(node?.inputs);
}

function inferOutputNodeIds(workflow: Record<string, unknown>) {
  return Object.entries(workflow)
    .filter(([, node]) => {
      const record = asRecord(node);
      if (!record) return false;
      const classType = String(record.class_type ?? record.type ?? "").toLowerCase();
      const metaTitle = String(asRecord(record._meta)?.title ?? "").toLowerCase();
      return (
        classType.includes("saveimage") ||
        classType.includes("save_image") ||
        classType.includes("savevideo") ||
        classType.includes("video") ||
        classType.includes("output") ||
        metaTitle.includes("save") ||
        metaTitle.includes("output")
      );
    })
    .map(([nodeId]) => nodeId);
}

export function validateComfyWorkflowDefinition(input: ComfyWorkflowInput): WorkflowValidationResult {
  if (!input.name.trim()) {
    return { valid: false, outputNodeIds: [], error: "Workflow name is required." };
  }
  if (Object.keys(input.workflow).length === 0) {
    return { valid: false, outputNodeIds: [], error: "Workflow JSON is empty." };
  }

  const mappedNodes = [
    ["positive prompt", input.positivePromptNode, input.positivePromptInput],
    ["negative prompt", input.negativePromptNode, input.negativePromptInput],
    ["seed", input.seedNode, input.seedInput]
  ] as const;
  for (const [label, nodeId, inputName] of mappedNodes) {
    if (!nodeId && !inputName) continue;
    if (!nodeId || !inputName) {
      return { valid: false, outputNodeIds: [], error: `${label} mapping requires both node id and input name.` };
    }
    const inputs = nodeInputs(input.workflow, nodeId);
    if (!inputs || !(inputName in inputs)) {
      return { valid: false, outputNodeIds: [], error: `${label} mapping does not match a workflow node input.` };
    }
  }

  const requestedOutputIds = input.outputNodeIds ?? [];
  const invalidOutputs = requestedOutputIds.filter((nodeId) => !input.workflow[nodeId]);
  if (invalidOutputs.length > 0) {
    return { valid: false, outputNodeIds: [], error: `Output node not found: ${invalidOutputs.join(", ")}.` };
  }
  const outputNodeIds = requestedOutputIds.length > 0 ? requestedOutputIds : inferOutputNodeIds(input.workflow);
  if (outputNodeIds.length === 0) {
    return { valid: false, outputNodeIds, error: "Workflow must include at least one output node before activation." };
  }

  return { valid: true, outputNodeIds, error: null };
}

export function workflowSummaryToInput(workflow: ComfyWorkflowSummary): ComfyWorkflowInput {
  return {
    id: workflow.id,
    name: workflow.name,
    workflow: workflow.workflow,
    positivePromptNode: workflow.positive_prompt_node,
    positivePromptInput: workflow.positive_prompt_input,
    negativePromptNode: workflow.negative_prompt_node,
    negativePromptInput: workflow.negative_prompt_input,
    seedNode: workflow.seed_node,
    seedInput: workflow.seed_input,
    outputNodeIds: workflow.output_node_ids,
    defaultForTiers: workflow.default_for_tiers,
    status: workflow.status
  };
}
