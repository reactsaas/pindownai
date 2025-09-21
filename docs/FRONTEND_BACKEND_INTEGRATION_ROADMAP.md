## Frontend → Backend Feature Roadmap

Mapping of existing frontend pages/components to the backend features and endpoints we need to implement. Prioritized for fast end‑to‑end usability with our current API and Firebase RTDB design.

---

## Legend
- Priority: P0 (now), P1 (next), P2 (later)
- Auth: Firebase JWT or platform API key

---

## 1) Pins (Dashboard)
Pages/Components
- `(dashboard)/pins/page.tsx`, `(dashboard)/pins/[pinSlug]/page.tsx`
- `BlocksList`, `AIBlockCreationModal`, `TemplateSettingsPopover`, `SharePopover`, `PublishPopover`

Backend Features
- Pins CRUD (uses existing routes for base data)
  - P0: GET `/api/pins` (list current user pins)
  - P0: GET `/api/pins/:pid` (pin details)
  - P0: POST `/api/pins/send` (create pin from markdown/json)
  - P0: DELETE `/api/pins/:pid`
- Blocks (content blocks inside a pin)
  - P0: POST `/api/pins/:pid/blocks` (create block)
  - P0: GET `/api/pins/:pid/blocks` (list blocks)
  - P0: PUT `/api/pins/:pid/blocks/:blockId` (update template/content)
  - P1: DELETE `/api/pins/:pid/blocks/:blockId`
  - Model: `pin_blocks/{pid}/{blockId}` with `{ name, type, template, updated_at }`
- Data sources configuration (multiple workflow IDs per pin)
  - P0: PUT `/api/pins/:pid/data-sources` with `{ wids: string[] }`
  - P0: GET `/api/pins/:pid/data-sources`
  - Model: `pin_data_sources/{pid} = { wids: [...] }`
- Versions & publishing
  - P1: POST `/api/pins/:pid/versions` (snapshot current blocks/template)
  - P1: GET `/api/pins/:pid/versions`
  - P0: POST `/api/pins/:pid/publish` (toggle `permissions.is_public` + create share link)
  - P1: POST `/api/pins/:pid/unpublish`
- Share links & access
  - P0: POST `/api/share-links` with `{ pid, visibility: public|unlisted, password? }`
  - P1: GET `/api/share-links?pid=...`
  - Public read route: P0: GET `/api/public/pins/:pid` (minimal, cacheable)

Realtime
- Subscribe client to `workflow_data/{pid}/{wid}` per configured `wid`.
- Optional: `pin_blocks/{pid}` for collaborative editing later (P2).

---

## 2) Share Pages
Pages
- `share/pin/[pinId]/page.tsx`
- `share/pinboard/[boardId]/(…)/page.tsx` (future)

Backend Features
- P0: Public pin fetch
  - GET `/api/public/pins/:pid` (returns published pin, metadata, optional composed template)
- P1: Public workflow data preview
  - GET `/api/public/workflow-data/:pid/:wid` (respect visibility)
- P1: Analytics
  - POST `/api/analytics/pin-view` with `{ pid }`
  - GET `/api/analytics/pins/:pid` (views over time)

---

## 3) Integrations
Pages/Components
- `(dashboard)/integrations/page.tsx`, `IntegrationsPage`

Backend Features
- P1: Catalog & connection status
  - GET `/api/integrations` (list available integrations + status)
- P0: Webhooks ingestion (generic)
  - POST `/api/integrations/webhook/:pid/:wid` (signed secret header) → writes to `workflow_data/{pid}/{wid}`
  - Secret management: GET/POST `/api/integrations/secrets/:pid/:wid` (rotate/regenerate)
- P2: OAuth/connection flows per provider (Stripe, Slack, etc.)

---

## 4) API Keys (Platform)
Pages/Components
- `(dashboard)/api-keys/page.tsx`, `APIKeysPage`

Backend Features
- Use existing routes
  - P0: POST `/api/auth/api-keys` (generate)
  - P0: GET `/api/auth/api-keys` (list)
  - P0: DELETE `/api/auth/api-keys/:keyId`
- Frontend task
  - Wire UI to these endpoints (currently mocked/local)

Note: Third‑party provider keys (OpenAI, etc.) remain local for now. If server‑side usage is needed later, add encrypted storage endpoints (P2).

---

## 5) Documents
Pages/Components
- `(dashboard)/documents/page.tsx`, `DocumentsPage`

Backend Features
- Storage approach
  - Option A (P0): Client uploads directly to Firebase Storage; backend stores metadata
  - Option B (P1): Backend pre‑signed URLs (GCS/S3)
- Endpoints
  - P0: POST `/api/documents` (metadata: name, size, type, storage_path)
  - P0: GET `/api/documents` (list user docs)
  - P0: DELETE `/api/documents/:docId`
  - P1: GET `/api/documents/:docId/download` (signed URL)
- Model
  - `user_documents/{uid}/{docId} = { name, type, size, storage_path, created_at }`

---

## 6) Logs
Pages/Components
- `(dashboard)/logs`, `LogsPage`

Backend Features
- P1: Write runtime events (ingestion, errors, auth, webhooks)
  - RTDB: `logs/{uid}/{logId}` or `logs/{pid}` partitioned by pin
- Endpoints
  - P1: GET `/api/logs?pid=&wid=&level=&q=&limit=`
  - P2: SSE `/api/logs/stream` (live tail)

---

## 7) Prompts
Pages/Components
- `(dashboard)/prompts/page.tsx`, `PromptsPage`

Backend Features
- Endpoints
  - P1: POST `/api/prompts`
  - P1: GET `/api/prompts`
  - P1: PUT `/api/prompts/:id`
  - P1: DELETE `/api/prompts/:id`
- Model
  - `user_prompts/{uid}/{promptId} = { name, description, content, category, usage_count }`

---

## 8) Pinboard
Pages/Components
- `(dashboard)/pinboard/page.tsx`

Backend Features
- Collections of references (templates, documents, prompts, workflows)
- Endpoints
  - P1: POST `/api/pinboards`
  - P1: GET `/api/pinboards`
  - P1: POST `/api/pinboards/:boardId/items` (add reference)
  - P1: DELETE `/api/pinboards/:boardId/items/:itemId`
- Model
  - `user_pinboards/{uid}/{boardId}` + `user_pinboard_items/{uid}/{boardId}/{itemId}`

---

## 9) Workflow (Playground)
Pages/Components
- `(dashboard)/workflow/page.tsx`, `MarkdownEditor`

Backend Features
- P1: Save named templates independent of pins (optional)
  - POST `/api/templates`, GET `/api/templates`, PUT `/api/templates/:id`, DELETE
- P0: Use pins + blocks as the primary template store (recommended)

---

## 10) Research
Pages/Components
- `(dashboard)/research/page.tsx`, `(dashboard)/research/list/[folderId]/page.tsx`

Backend Features (optional MVP)
- P2: Research jobs (e.g., Perplexity summaries) stored as sources
  - POST `/api/research/jobs` (queue external call)
  - GET `/api/research/jobs/:jobId`
  - Persist results as `workflow_data/{pid}/{wid}` or `research/{uid}`

---

## 11) Public/Access Control
Backend Features
- P0: Pin publish/unpublish (see Pins section)
- P1: Share links with passwords/expiry
- P1: Rate limiting & quotas by plan (per API key/user)
- P1: Usage endpoints for UI
  - GET `/api/usage` → counts: pins, blocks, bandwidth, API calls

---

## Data Model Additions (RTDB)
- `pin_blocks/{pid}/{blockId}` → block metadata + `template`
- `pin_data_sources/{pid}` → `{ wids: string[] }`
- `user_documents/{uid}/{docId}` → document metadata
- `logs/{pid}/{logId}` (or `logs/{uid}`)
- `user_prompts/{uid}/{promptId}`
- `user_pinboards/{uid}/{boardId}` + `user_pinboard_items/...`

All writes remain atomic via multi‑path updates where applicable.

---

## Phased Delivery
- P0 (Wire existing UI to API)
  - Pins list/detail; publish; data‑sources config
  - Blocks CRUD; Webhook ingestion endpoint
  - Public pin fetch for share pages
  - Documents metadata + client‑side storage flow
  - API keys UI → use existing endpoints
- P1 (Depth & Collaboration)
  - Versions; share links; prompts CRUD; pinboard; logs query
  - Integrations catalog + secrets; download URLs for docs
- P2 (Scale & Enterprise)
  - OAuth providers; SSE log streams; usage/quotas; analytics; research jobs

---

## Acceptance Criteria (P0)
- Create/list/delete pins from dashboard UI using backend.
- Configure `wids` for a pin and receive live updates on share page.
- Add/edit blocks within a pin and see updates reflected.
- Publish a pin and access it via public route with live data.
- Upload a document (client‑side storage), store metadata via API, list/delete.
- Generate/manage platform API keys from the dashboard UI.


