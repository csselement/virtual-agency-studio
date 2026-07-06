# UI Design System

Virtual Agency Studio uses the supplied ThoughtStream monochrome system: minimal, warm, sharp-edged, and flat.

## Tokens

- Background: `#FAFAF9`
- Surface: `#F5F5F4`
- Raised surface: `#EFEDEB`
- Text primary: `#1C1917`
- Text secondary: `#57534E`
- Text tertiary: `#A8A29E`
- Border subtle: `#E7E5E4`
- Border medium: `#D6D3D1`
- Border strong: `#A8A29E`
- Primary action: `#78716C`
- Success: `#65A30D`
- Warning: `#CA8A04`
- Error: `#DC2626`

### Social Icon Tokens

Social platform marks are the only approved color exception to the monochrome system. Use full-spectrum brand marks so platform recognition is immediate, while all surrounding UI stays neutral.

- Instagram spectrum: `#FCB045`, `#FD8D32`, `#FD1D1D`, `#E1306C`, `#833AB4`
- YouTube icon: `#FF0033` with white play mark
- TikTok spectrum: `#25F4EE`, `#FE2C55`, `#000000`
- X: `#000000`
- Threads: `#000000`
- Blog/generic publishing: `#78716C`

## Typography

- Product UI, page titles, navigation, tables, labels, and controls use `Suisse Int'l, Suisse Intl, Suisse International, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif`.
- Editorial serif type is reserved for rare narrative/content moments only. Operational page chrome must stay sans.
- Top-level page chrome should not carry eyebrow labels, subtitles, or redundant direct controls. Use the page title plus global system chrome.
- Machine values, IDs, and times use `Source Code Pro, Fira Code, Consolas, monospace`.
- Keep letter spacing at `0` for app stability.

## Layout

- Use a 12px spacing base.
- Page headers are a compact 64px single row on tablet/desktop.
- Use `16px` vertical rhythm between top-level page sections.
- Separate sections with hairline borders and white space.
- Keep dashboard panels flat. No shadows.
- Use restrained radius: `4px` only for controls, padded cards, framed shelves, thumbnails, and selected rows.
- Sections that are organized by dividing lines stay square: page bands, tables, ledgers, matrix panels, dossier panels, and definition-list fact sections.
- Prefer compact shelves and rows over repeated tall cards when lists can grow.
- Metrics are facts, not hero content. Keep operational numbers compact and subordinate to workflow.
- Use full rounding only for tiny live-status marks, stage dots, and true avatar crops.
- Mobile must collapse without horizontal overflow.

## Components

- Buttons: flat with default `4px` corner radius and 12px/24px padding; primary uses `#78716C`, secondary is transparent.
- Cards: background `#FAFAF9`, border `#E7E5E4`, padding from the 12px scale.
- Inputs: 48px tall, border `#D6D3D1`, sharp edges, visible focus ring.
- Lists: 16px vertical padding, `#E7E5E4` row dividers.
- Status chips: uppercase labels with semantic color and text.
- Icons: system icons use monochrome Phosphor marks; social icons use the social icon tokens above and must not sit inside bordered boxes.

## Rules

- Let white space and typography do the work.
- Use borders instead of shadows.
- Avoid gradients, glows, decorative blobs, and rounded cards.
- Treat the calendar/publishing desk as the reference composition: strict rail, ledger grid, right dossier, no explanatory walls of text.
- Do not add explanatory copy when labels and structure can carry the flow.
