import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://127.0.0.1:4317").replace(/\/+$/, "");
const workflowPath = resolve(process.env.WORKFLOW_FILE ?? "docs/comfy-faceid-instantid-workflow.json");
const workflow = JSON.parse(await readFile(workflowPath, "utf8"));

const workflowId = process.env.WORKFLOW_ID ?? "comfy_workflow_faceid_instantid_sfw";
const tiers = (process.env.WORKFLOW_TIERS ?? "sfw_standard,sfw_sensitive")
  .split(",")
  .map((tier) => tier.trim())
  .filter(Boolean);

async function request(path, init) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed with ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

const savePayload = {
  id: workflowId,
  name: "FaceID InstantID SFW Character Shoot",
  workflow,
  positivePromptNode: "5",
  positivePromptInput: "text",
  negativePromptNode: "6",
  negativePromptInput: "text",
  seedNode: "12",
  seedInput: "seed",
  referenceImageNode: "22",
  referenceImageInput: "image",
  outputNodeIds: ["14"],
  defaultForTiers: tiers,
  status: "draft"
};

const saved = await request("/api/settings/comfy-workflows", {
  method: "POST",
  body: JSON.stringify(savePayload)
});

for (const tier of tiers) {
  await request(`/api/settings/comfy-workflows/${encodeURIComponent(saved.workflow.id)}/activate`, {
    method: "POST",
    body: JSON.stringify({ tier })
  });
}

if (process.env.SET_COMFY_DEFAULT_PROVIDER === "true") {
  await request("/api/settings/providers", {
    method: "PATCH",
    body: JSON.stringify({
      mockProviders: false,
      defaultImageGenerationProvider: "comfyui-cloud"
    })
  });
}

const workflows = await request("/api/settings/comfy-workflows", { method: "GET" });
const installed = workflows.workflows?.find((workflowItem) => workflowItem.id === saved.workflow.id);
console.log(
  JSON.stringify(
    {
      apiBaseUrl,
      workflowId: saved.workflow.id,
      status: installed?.status,
      defaultForTiers: installed?.default_for_tiers,
      referenceImageNode: installed?.reference_image_node,
      referenceImageInput: installed?.reference_image_input
    },
    null,
    2
  )
);
