# Comfy Cloud FaceID/InstantID Workflow

VAS includes a Comfy Cloud API workflow template for higher-control character shoots:

- Workflow JSON: `docs/comfy-faceid-instantid-workflow.json`
- Installer: `npm run comfy:install-faceid`
- Default API target: `http://127.0.0.1:4317`

The workflow is intended for SFW character portraits. It uses a character reference image through a `LoadImage` node, then applies InstantID plus IPAdapter FaceID before sampling. Checkpoint and model filenames may need adjustment if the Comfy Cloud workspace has different installed models.

`Virtual Agency Studio` treats the character profile reference image as the source of truth for identity. For ComfyUI identity workflows, the character must have an approved profile reference before generation proceeds.

## VAS mappings

The installer saves these mappings through the Settings API:

| Purpose | Node | Input |
| --- | --- | --- |
| Positive prompt | `5` | `text` |
| Negative prompt | `6` | `text` |
| Seed | `12` | `seed` |
| Character reference image | `22` | `image` |
| Output | `14` | `images` |

At generation time, VAS uses the approved character reference image from the existing character reference upload area. The provider uploads that local file to Comfy Cloud with `/api/upload/image`, then injects the returned filename into node `22.image` before submitting `/api/prompt`.

If this workflow is active and a character has no approved reference image, image generation stops in `needs_review` before provider spend.

## Install locally

```bash
npm run comfy:install-faceid
```

To point at a deployed API:

```bash
API_BASE_URL=http://orangepi.local:4317 npm run comfy:install-faceid
```

To also set the default image provider to Comfy Cloud:

```bash
SET_COMFY_DEFAULT_PROVIDER=true npm run comfy:install-faceid
```

## Multi-angle reference expansion

For stronger identity consistency from one uploaded reference, run the same FaceID workflow several times with controlled prompt suffixes and approve only the strongest outputs as additional character references:

- `front-facing headshot, neutral expression, even daylight`
- `three-quarter left portrait, same face, natural expression`
- `three-quarter right portrait, same face, natural expression`
- `profile portrait, same face, hair tucked back, clean background`

These should be treated as reference candidates, not automatic canon. Approve them manually after identity review so later shoots have more facial angles to condition on.

Roadmap for stronger consistency with one source image:

1. Use the approved profile reference as the immutable identity anchor for all production generations.
2. Add an operator-triggered batch run that generates multiple angle-controlled FaceID variants and then promotes the best outputs into additional approved references.
