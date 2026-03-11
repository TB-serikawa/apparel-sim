# CLAUDE.md — apparel-sim

> This file provides guidance to AI assistants (Claude, Copilot, etc.) working inside this repository.
> Keep it up to date as the project evolves.

---

## Project Overview

**Repository:** `TB-serikawa/apparel-sim`
**Purpose:** Apparel simulation — *(describe what this project does once the codebase is established)*

This file was auto-generated on project initialization. Update each section as the codebase grows.

---

## Repository Status

> **Note:** As of the initial commit this repository contains no source code.
> All sections below are templates. Replace placeholder text with accurate information once the project is scaffolded.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | *(e.g. TypeScript / Python / Rust)* |
| Framework | *(e.g. React / Next.js / FastAPI)* |
| Styling | *(e.g. Tailwind CSS / CSS Modules)* |
| Database | *(e.g. PostgreSQL / SQLite / none)* |
| Testing | *(e.g. Vitest / Jest / pytest)* |
| Build tool | *(e.g. Vite / webpack / Cargo)* |
| Package manager | *(e.g. pnpm / npm / yarn / pip / cargo)* |

---

## Directory Structure

```
apparel-sim/
├── CLAUDE.md          # This file
├── README.md          # Human-facing project documentation
├── src/               # Primary source code (update when scaffolded)
├── tests/             # Test files
├── public/            # Static assets (if web project)
└── ...
```

Update this tree once the actual structure is established.

---

## Getting Started

### Prerequisites

- *(list runtime versions, e.g. Node ≥ 20, Python ≥ 3.11)*

### Install dependencies

```bash
# e.g.
npm install
# or
pnpm install
# or
pip install -r requirements.txt
```

### Run in development mode

```bash
# e.g.
npm run dev
```

### Build for production

```bash
# e.g.
npm run build
```

---

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Describe where test files live (e.g., co-located `*.test.ts` files, or a top-level `tests/` directory).

---

## Linting & Formatting

```bash
# Lint
npm run lint

# Format
npm run format
```

Note any pre-commit hooks (Husky, lefthook, etc.) or CI checks that must pass before merge.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| *(e.g. `API_URL`)* | Yes | *(what it controls)* |

Copy `.env.example` to `.env` and fill in values before running locally (once `.env.example` exists).

---

## Development Workflow

### Branch naming

```
claude/<description>-<session-id>   # AI-assisted feature branches
feat/<short-description>            # Human feature branches
fix/<short-description>             # Bug fixes
chore/<short-description>           # Maintenance / tooling
```

### Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add garment mesh renderer
fix: correct UV seam artifacts on sleeve panel
chore: upgrade vite to 6.x
docs: document simulation parameters
```

### Pull request process

1. Create a branch off `main` (or the agreed base branch).
2. Make changes and commit with descriptive messages.
3. Ensure all tests and linting checks pass locally.
4. Push and open a PR — describe *what* changed and *why*.
5. Request at least one reviewer before merging.

---

## Code Conventions

*(Fill in once the project has an established style. Examples below.)*

- **Naming:** camelCase for variables/functions; PascalCase for classes/components; UPPER_SNAKE_CASE for constants.
- **Imports:** absolute imports preferred over relative where the tooling supports it.
- **Types:** prefer explicit type annotations; avoid `any`.
- **Comments:** write comments to explain *why*, not *what* — the code shows the what.
- **File size:** keep files focused; split large files into smaller modules.

---

## AI Assistant Guidelines

When working in this repository as an AI assistant:

1. **Read before editing.** Always read a file fully before modifying it.
2. **Minimal changes.** Make only the changes required by the task; do not refactor unrelated code.
3. **No speculative features.** Do not add error handling, logging, or abstractions for hypothetical future scenarios.
4. **Tests.** When adding or modifying logic, update or add tests to cover the change.
5. **Lint/format.** Run linting and formatting after making code changes.
6. **Commit messages.** Follow the Conventional Commits style above.
7. **Branch.** Always develop on the designated branch; never push directly to `main`.
8. **Secrets.** Never commit credentials, tokens, or secrets. Use environment variables.
9. **Ask when uncertain.** If the task is ambiguous, clarify before making large changes.

---

## Known Issues / TODOs

- [ ] Scaffold the project (choose framework and initialize)
- [ ] Add CI/CD pipeline (e.g. GitHub Actions)
- [ ] Define environment variable schema
- [ ] Write a proper README.md

---

*Last updated: 2026-03-11 — initial skeleton, no source code yet.*
