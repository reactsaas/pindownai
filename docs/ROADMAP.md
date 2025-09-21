# PinDown.ai Product & Engineering Roadmap

This roadmap outlines phased delivery for the real‑time pin system: Fastify backend with Firebase RTDB, and a Next.js frontend with a smart, real‑time Markdown template engine. It reflects current progress and expands toward a production‑ready, scalable product.

---

## Vision & Goals
- Provide an API and UI to turn raw automation/workflow data into live, shareable pages.
- Support multiple workflow data sources per pin with real‑time updates.
- Offer developer‑friendly APIs, robust auth, strong safety, and great UX performance.

---

## Architecture Snapshot
- Backend: Fastify, Zod validation, Firebase Admin (Auth + RTDB), custom error handling, API key support.
- Data: Firebase RTDB with `pins`, `workflow_data/{pid}/{wid}`, `user_pins/{uid}/{pid}`, `api_keys/{uid}/{keyId}`.
- Frontend: Next.js, Firebase client SDK, multi‑subscription to `workflow_data` per `wid`, smart Markdown templating, selective updates.
- Realtime: Single WebSocket per client; multiplexed individual RTDB subscriptions for minimal bandwidth.

---

## Phase 0 — Repo Hygiene & Secrets (Now)
Scope
- Remove secrets from history, enforce `.gitignore`, set up secret scanning and pre‑push hooks.

Deliverables
- History scrub for leaked keys (GitHub Push Protection compliant).
- Docs: “Secrets & Environments”.

Acceptance Criteria
- All pushes pass GitHub secret scanning.
- Environments backed by `.env` and CI/CD secrets only.

Risks & Mitigation
- Secret leak recurrence → Commit hooks and CI checks.

---

## Phase 1 — Core Backend API (In Progress)
Scope
- CRUD for pins, workflow data upsert/get, API keys, dual auth (Firebase JWT or API key), consistent errors, Zod validation.

Deliverables
- Endpoints: `POST /api/pins/send`, `GET/DELETE /api/pins/:pid`, `GET /api/pins`, `PUT /api/workflow-data/:pid/:wid`, `GET /api/workflow-data/:pid(/:wid)`, `POST/GET/DELETE /api/auth/api-keys`.
- Plugins: `firebase`, `auth`, `error-handler`.
- Swagger docs via Zod provider.

Acceptance Criteria
- Local dev server stable; requests validated; consistent JSON errors.
- Unit coverage for utils and plugins (baseline).

Risks & Mitigation
- Schema drift → Centralized Zod schemas and typed route providers.

---

## Phase 2 — RTDB Schema & Security Rules
Scope
- Finalize RTDB structure and security rules for pins, workflow data, indexes (`user_pins`), and `api_keys`.

Deliverables
- `database.rules.json` with unit tests (Firebase Emulator).
- Rule coverage for: owner read/write, public read, API key scoped writes.

Acceptance Criteria
- Emulator tests pass for: owner access, public pins, denied cross‑user access, api‑key write paths.

Risks & Mitigation
- Over‑permissive rules → Test matrix with negative cases.

---

## Phase 3 — Realtime Update System
Scope
- Implement granular subscriptions: `workflow_data/{pid}/{wid}` per source; connection state; change detection.

Deliverables
- Backend: atomic multi‑path updates for workflow data.
- Frontend hook: `useMultiWorkflowData(pid, wids)` with connection and error states.

Acceptance Criteria
- Multiple `wid` subscriptions update UI within 200 ms median on local.
- Bandwidth verified minimal vs. monolithic subscription.

Risks & Mitigation
- Excessive updates → Debounce/batching; path‑level subscriptions.

---

## Phase 4 — Frontend Foundation
Scope
- Next.js structure, auth context, basic pin pages, UI shell, dark mode, responsive design.

Deliverables
- `auth-context`, shared UI, navigation, share pages scaffold.
- Firebase client SDK setup and login flows (Google/GitHub).

Acceptance Criteria
- Authenticated users see their pins list; share page loads by `pid`.

Risks & Mitigation
- Token lifecycle issues → Central auth provider and guards.

---

## Phase 5 — Smart Template Engine
Scope
- Template parser with variables like `{{wd_01.revenue}}`, filters (`currency`, `percent`, `status_badge`), loops, conditionals.
- Selective updates: reprocess only impacted nodes when data changes.

Deliverables
- Core: `TemplateEngine` + `useSmartTemplateEngine`.
- Markdown renderer adapters (ReactMarkdown extensions).

Acceptance Criteria
- Rendering cost scales with changed variables only; 60 FPS on typical updates.
- Robust error messages for missing variables/filters.

Risks & Mitigation
- Complex diffing → Cache parsed AST, variable → node index.

---

## Phase 6 — Share Pages & Collaboration Basics
Scope
- Public share links, pin visibility settings, basic analytics (views), publish workflow.

Deliverables
- Share routes under `/share/pin/[pid]` with real‑time content.
- Publish controls and preview mode.

Acceptance Criteria
- Public pins render without auth; private pins require owner.

Risks & Mitigation
- Link spoofing → Strict rules and signed preview tokens.

---

## Phase 7 — Testing & Quality
Scope
- Unit, integration (API + RTDB emulators), and E2E (Playwright) coverage.

Deliverables
- Test suites, fixtures, coverage reports in CI.

Acceptance Criteria
- >80% statements on core; green CI on PRs.

Risks & Mitigation
- Flaky realtime tests → Deterministic fixtures and generous timeouts.

---

## Phase 8 — Packaging, CI/CD, Deployment
Scope
- Dockerfiles, docker‑compose for dev, GitHub Actions, staging environment.

Deliverables
- Backend Dockerfile, Next.js build pipeline, environment segregation.
- Observability: logs, metrics, alerts (e.g., Better Stack/Datadog).

Acceptance Criteria
- One‑click deploy to staging; rollbacks available.

Risks & Mitigation
- Env mismatch → `.env` contracts and health checks.

---

## Phase 9 — Performance & Cost Optimization
Scope
- Batching, compression for large payloads, cache where useful, query optimization.

Deliverables
- Performance budget, dashboards (LCP, TTI, CPU time, bandwidth).

Acceptance Criteria
- Median TTFB < 200 ms (staging), LCP < 2.5 s on 4G, bandwidth reduced vs. baseline.

Risks & Mitigation
- Hot paths → Profiling and targeted caching.

---

## Phase 10 — Integrations & SDKs
Scope
- HTTP SDKs (JS/TS first), Zapier/Make/n8n, webhooks, signed ingestion.

Deliverables
- `@pindownai/sdk` (TS) with typed endpoints and retries.
- Zapier app (beta), webhook receiver with signing.

Acceptance Criteria
- Example apps post data end‑to‑end with minimal setup.

Risks & Mitigation
- Rate‑limit abuse → Quotas and usage tracking per key.

---

## Phase 11 — Enterprise Readiness
Scope
- RBAC, audit logs, SSO/SAML, orgs/projects, retention policies, exports.

Deliverables
- Org model and roles, audit trail for data changes and access.

Acceptance Criteria
- Admins manage roles; audit logs resolve incidents.

Risks & Mitigation
- Compliance gaps → Early reviews for SOC2/GDPR trajectory.

---

## Phase 12 — Monetization & Growth
Scope
- Plans, quotas, billing, usage dashboards, trials.

Deliverables
- Stripe billing, plan limits (pins, data sources, bandwidth), overage handling.

Acceptance Criteria
- Accurate metering; self‑serve upgrade path.

Risks & Mitigation
- Cost anomalies → Budget alerts and throttling.

---

## Timeline (Indicative)
- Weeks 1–2: Phase 0–1 (core backend stable). ✓ Phase 1 ~95% complete.
- Weeks 3–4: Phase 2–3 (rules, realtime foundation).
- Weeks 5–6: Phase 4–5 (frontend foundation + smart templating).
- Weeks 7–8: Phase 6–7 (share pages, testing, polish).
- Weeks 9–10: Phase 8–9 (deploy, perf/cost).
- Weeks 11+: Phase 10–12 (integrations, enterprise, monetization).

---

## KPIs & Quality Gates
- API success rate ≥ 99.9% week over week.
- Median API latency ≤ 200 ms (staging), ≤ 300 ms (prod) for core routes.
- Frontend: LCP ≤ 2.5 s, CLS ≤ 0.1 on share pages.
- Error budgets and performance budgets tracked.

---

## Immediate Next Steps
1) Fix GitHub Push Protection violations and scrub history if needed (Phase 0).
2) Finalize and test RTDB security rules with emulator (Phase 2).
3) Implement `useMultiWorkflowData` and selective subscriptions (Phase 3).
4) Begin smart template engine core with variable index + filters (Phase 5).


