# MVP Scope: Pins Ingestion & Sharing

Goal: Minimal, end-to-end flow to create pins via API, list/view in dashboard, and open a public share page with live data.

## Block Types Supported
- **Markdown** (P0): Paragraphs and formatted text content with template variables
- **Mermaid Diagram** (P1): Flowcharts, sequence diagrams, and other diagrams
- **Conditional** (P1): Content that shows based on conditions
- **Image** (P1): Images and media content
- **Image Steps** (P1): Step-by-step instructions with images

## Tasks (P0)
- [ ] Backend: Verify `/api/pins/send` happy path with Zod validation and error responses
- [ ] Backend: Public read route `GET /api/public/pins/:pid` (published pins only)
- [ ] Backend: Publish toggle `POST /api/pins/:pid/publish` and `POST /api/pins/:pid/unpublish`
- [ ] Backend: Data sources config `PUT /api/pins/:pid/data-sources` and `GET /api/pins/:pid/data-sources`
- [ ] Backend: Blocks CRUD (minimal) under `pin_blocks/{pid}` → `POST / GET / PUT / DELETE`
  - Support `type: "markdown"` with `template` field containing markdown + variables
  - Block model: `{ id, name, type, template, order, created_at, updated_at }`
- [ ] Backend: Webhook ingestion `POST /api/integrations/webhook/:pid/:wid` (signed) → writes `workflow_data/{pid}/{wid}`
- [ ] Frontend: Dashboard pins list uses `GET /api/pins`
- [ ] Frontend: Pin detail loads `GET /api/pins/:pid` and lists/edits blocks
- [ ] Frontend: Share page loads `GET /api/public/pins/:pid`, subscribes to `workflow_data/{pid}/{wid}` per wid, and renders `pin_blocks` with template variables (e.g., `{{wd_01.revenue}}`)
- [ ] Frontend: Basic template engine (AST cache optional) to replace variables from multiple data sources; selective re-render on changed keys
- [ ] Frontend: Markdown block renderer with variable substitution and real-time updates
- [ ] Testing: Postman collection for pins (send, get, publish, public get); example cURL for webhook ingestion

## Nice-to-have (P1)
- [ ] Additional block types: Mermaid Diagram, Conditional, Image, Image Steps
- [ ] Share links with password/expiry
- [ ] Basic analytics: `POST /api/analytics/pin-view`

## Test Steps
1) Create pin: `POST /api/pins/send` with JSON and Markdown bodies (see examples).
2) List pins: `GET /api/pins` → confirm new pin present.
3) Publish: `POST /api/pins/:pid/publish` → returns `{ is_public: true }`.
4) Public fetch: `GET /api/public/pins/:pid` without auth → returns metadata/content.
5) Create blocks for the pin and verify they render in share page order.
6) Ingest data: `POST /api/integrations/webhook/:pid/:wid` → verify in RTDB.
7) Share page updates values in real time when RTDB changes.

## Folders & Files
- `backend-api/src/routes/pins/`
  - `index.ts` (routes)
  - `examples/`
    - `send-json.request.json`
    - `send-markdown.request.json`
    - `send.response.json`

## Acceptance Criteria
- Able to create, list, publish, and publicly fetch a pin.
- Live updates on share page for configured `wid` via RTDB.
- Example JSON files enable quick onboarding/testing.
