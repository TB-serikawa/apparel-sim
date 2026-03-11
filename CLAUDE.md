# CLAUDE.md — apparel-sim

> This file provides guidance to AI assistants working in this repository.
> Keep it up to date as the project evolves.

---

## Project Overview

**Repository:** `TB-serikawa/apparel-sim`

**Purpose:** A browser-based real-time 3D sportswear design and manufacturing system.
Users design garments in a 3D viewport; the system automatically syncs those edits to 2D pattern
pieces (via UV mapping) and exports factory-ready manufacturing data without any server-side
rendering costs.

### Core Value Propositions

1. **Real-time 3D editing in the browser** — no dedicated software needed. Users rotate the 3D
   model 360°, change colors, drag-and-drop logos, and see results instantly (WebGL/Three.js).
2. **3D ↔ 2D parametric sync** — every edit on the 3D model is immediately reflected in the
   underlying 2D pattern pieces (front panel, sleeves, etc.) via UV-map linkage.
3. **One-click factory export** — on design confirmation, the system auto-generates:
   - CAD pattern data (DXF)
   - Sublimation-print image per pattern piece (high-res PNG/TIFF)
   - Sewing specification sheet (PDF)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **3D Rendering** | Three.js (React Three Fiber) | WebGL, runs entirely in the browser |
| **Frontend Framework** | Next.js | App Router preferred |
| **Hosting** | Vercel | Zero-config deployment for Next.js |
| **Backend / Processing** | AWS Lambda + API Gateway | Serverless; scales on demand |
| **Database** | Amazon DynamoDB | Design data stored as JSON documents |
| **Storage** | Amazon S3 | 3D model files (GLTF/GLB), exported manufacturing data |
| **3D Format** | GLTF / GLB | Standard interchange format for Three.js |
| **Export** | DXF (patterns), PNG/TIFF (print), PDF (spec sheet) | Generated server-side on Lambda |
| **Language** | TypeScript | Strict mode |
| **Package manager** | pnpm | Preferred for monorepo-friendly lockfiles |

---

## Architecture

```
Browser (Next.js + React Three Fiber)
  │
  │   WebGL 3D viewport
  │   ├─ Load .glb garment model
  │   ├─ UV-mapped material editor (color, pattern, logo placement)
  │   └─ Real-time 2D pattern preview panel
  │
  │   On "Confirm Design" → POST /api/export
  ▼
API Gateway → AWS Lambda
  ├─ Render high-res sublimation print per UV island (PNG/TIFF)
  ├─ Generate DXF pattern file
  ├─ Render PDF spec sheet
  └─ Upload outputs to S3, return signed download URLs
  │
  ▼
Amazon S3 (manufacturing output files)
Amazon DynamoDB (saved design sessions, user data)
```

### Key Technical Concept — UV Map Sync

The central challenge and innovation of this system is the **3D-to-2D UV sync**:

- Each garment model (.glb) is authored with a clean, unwrapped UV layout — one island per
  pattern piece (front body, back body, left sleeve, right sleeve, etc.)
- In the browser, the `canvas` element that represents each UV island is kept in memory alongside
  the Three.js scene
- Any edit in 3D (color fill, logo drag, pattern tile) writes to the corresponding UV-canvas
  texture; Three.js reads that canvas as a `CanvasTexture` and updates the 3D viewport in the
  same frame
- On export, those canvases are sent at full print resolution to Lambda for final compositing

---

## Directory Structure (planned)

```
apparel-sim/
├── CLAUDE.md
├── README.md
├── package.json               # Root (monorepo or single Next.js app)
├── pnpm-workspace.yaml        # If monorepo
│
├── apps/
│   └── web/                   # Next.js frontend
│       ├── app/               # App Router pages
│       │   ├── page.tsx       # Landing / product selector
│       │   ├── designer/
│       │   │   └── [itemId]/
│       │   │       └── page.tsx  # Main 3D design canvas
│       │   └── api/
│       │       └── export/
│       │           └── route.ts  # Next.js Route Handler → calls Lambda
│       ├── components/
│       │   ├── viewer/        # Three.js / R3F scene components
│       │   │   ├── GarmentViewer.tsx
│       │   │   ├── MaterialEditor.tsx
│       │   │   └── UVCanvas.tsx
│       │   ├── ui/            # General UI (buttons, panels, etc.)
│       │   └── export/        # Export confirmation dialog, download UI
│       ├── lib/
│       │   ├── uv-sync.ts     # Core UV-canvas ↔ Three.js sync logic
│       │   ├── garment.ts     # Garment model loader and metadata
│       │   └── export.ts      # Client-side export request builder
│       └── public/
│           └── models/        # .glb garment files
│
└── packages/
    └── export-lambda/         # AWS Lambda export function (TypeScript)
        ├── handler.ts
        ├── pdf.ts
        ├── dxf.ts
        └── print-render.ts
```

---

## Development Roadmap

### Phase 1 — 3D-2D PoC (Month 1–2)

- [ ] Set up Next.js + React Three Fiber project
- [ ] Author/source a simple T-shirt .glb with clean UV unwrap
- [ ] Implement real-time color change on 3D model via `CanvasTexture`
- [ ] Implement logo drag-and-drop on 3D surface
- [ ] Show live 2D UV-island preview alongside the 3D viewport
- [ ] Technical validation: confirm UV edit accuracy vs. physical print

### Phase 2 — MVP + Data Export (Month 3–4)

- [ ] AWS Lambda: high-res sublimation print image generation (per UV island)
- [ ] AWS Lambda: DXF pattern file generation
- [ ] AWS Lambda: PDF sewing specification sheet
- [ ] S3 upload + signed URL download flow
- [ ] Basic design save/load (DynamoDB)
- [ ] Factory integration test with real print data

### Phase 3 — Beta Launch (Month 5+)

- [ ] Expand supported garment types beyond T-shirt (jersey, shorts, jacket)
- [ ] User authentication and project management
- [ ] D2C brand / team-wear ordering workflow
- [ ] Partner onboarding for initial launch

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- AWS CLI configured (for Lambda/S3/DynamoDB work)

### Install dependencies

```bash
pnpm install
```

### Run in development mode

```bash
pnpm dev
# Opens http://localhost:3000
```

### Build for production

```bash
pnpm build
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

- Use **Vitest** for unit tests (fast, ESM-native, compatible with React Testing Library)
- Test files co-located as `*.test.ts` / `*.test.tsx`
- 3D/WebGL components: mock Three.js renderer in tests; focus unit tests on UV-sync logic and
  export data-generation logic

---

## Linting & Formatting

```bash
pnpm lint      # ESLint
pnpm format    # Prettier
```

Config: ESLint with `eslint-config-next`, Prettier defaults, TypeScript strict mode.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for export API (Lambda via API Gateway) |
| `AWS_REGION` | Lambda | AWS region for DynamoDB/S3 |
| `S3_BUCKET_NAME` | Lambda | S3 bucket for storing export outputs |
| `DYNAMODB_TABLE_NAME` | Lambda | DynamoDB table for design sessions |

Copy `.env.local.example` to `.env.local` for local development.

---

## Development Workflow

### Branch naming

```
claude/<description>-<session-id>   # AI-assisted branches
feat/<short-description>            # Human feature branches
fix/<short-description>             # Bug fixes
chore/<short-description>           # Tooling / maintenance
```

### Commit style — Conventional Commits

```
feat: add real-time UV canvas texture sync
fix: correct UV island boundary sampling for sleeve seam
chore: upgrade three.js to r168
docs: document UV-sync architecture
```

### Pull request process

1. Branch off `main`.
2. Implement changes; ensure tests and lint pass.
3. Push and open a PR with clear description of *what* and *why*.
4. One reviewer approval required before merge.

---

## Code Conventions

- **Language:** TypeScript strict mode throughout; no `any`.
- **Naming:** camelCase for variables/functions, PascalCase for components/classes,
  UPPER_SNAKE_CASE for constants.
- **Components:** React functional components only; hooks for state and side-effects.
- **Three.js in React:** use React Three Fiber (`@react-three/fiber`) and Drei
  (`@react-three/drei`) abstractions rather than imperative Three.js where possible.
- **UV textures:** always work with `CanvasTexture`; call `texture.needsUpdate = true` after any
  canvas paint operation.
- **Imports:** use path aliases (`@/components/...`, `@/lib/...`) — no deep relative paths.
- **Comments:** explain *why*, not *what*. Non-obvious UV math and shader code must be commented.
- **File size:** one component/module per file; split when a file exceeds ~200 lines.

---

## AI Assistant Guidelines

1. **Read before editing.** Always read the target file fully before modifying it.
2. **Minimal changes.** Only change what the task requires; do not refactor unrelated code.
3. **UV sync is the core.** When touching `lib/uv-sync.ts` or any `CanvasTexture` logic,
   be especially careful — incorrect UV math will corrupt print output.
4. **Tests.** Add or update tests when modifying logic in `lib/` or `packages/export-lambda/`.
5. **No speculative code.** No extra error handling, logging, or abstractions for hypothetical
   scenarios.
6. **Lint/format after edits.** Run `pnpm lint && pnpm format` after code changes.
7. **Conventional Commits.** Follow the commit style above.
8. **Correct branch.** Develop on the designated `claude/` branch; never push to `main`.
9. **Secrets.** Never commit credentials or tokens. Use environment variables.
10. **3D assets.** Do not commit large `.glb`/`.gltf` files to git — use Git LFS or S3 + a
    download script.

---

*Last updated: 2026-03-11 — updated with full system spec from proposal document.*
