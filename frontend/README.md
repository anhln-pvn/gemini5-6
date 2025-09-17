# PVN Digital Twin Frontend Prototype

This folder contains a static web prototype that visualises the PVN digital twin workflow defined in the Google ADK backend (`pvn_digital_twin`). The UI focuses on the “Quy chế 4281” procurement workflow and exposes:

- An interactive graph of the PVN board, executive leadership, and specialist divisions.
- Workflow orchestration controls (session bootstrap, workflow trigger, document upload).
- A timeline view of phases/steps with live status, outputs, and history taken from ADK session state.
- Aggregated KPIs, final summary, and raw event log to support digital-twin style analytics.

The frontend is written in vanilla ES modules and CSS, so no build tooling is required.

## Prerequisites

1. **Install & run the backend ADK API server** inside the repo root:
   ```bash
   # within /Users/.../gemini5-5-front
   adk api_server
   ```
   This exposes the default FastAPI endpoints on `http://localhost:8000`.

2. **Serve the frontend** from the `frontend/` directory (using any static HTTP server, for example Python’s built-in server):
   ```bash
   cd frontend
   python -m http.server 5173
   ```
   Then visit `http://localhost:5173` in a browser.

> ⚠️ Opening the HTML file via `file://` will block ES module imports – always use an HTTP server.

## Using the UI

1. **Connect to API server**: adjust the API URL if needed (defaults to `http://localhost:8000`) and click “Kiểm tra”. The badge should turn green when ADK responds.
2. **Create a session**: provide/confirm the app name (`pvn_digital_twin`), user ID, and session ID (random defaults are pre-filled) then click “Tạo/Cập nhật session”. The session summary in the sidebar will show the active IDs.
3. **Choose workflow**: currently only “Quy trình mua sắm dịch vụ truyền thông” is bundled but the selector is ready for future workflows.
4. **Upload document**: drag & drop or click the drop zone to attach the incoming document (PDF/DOCX/TXT up to 10 MB). A base64 payload is prepared and the run button is enabled.
5. **Send to ADK**: add optional instructions in the notes box and press “Gửi vào hệ thống”. The call goes to `POST /run`, followed by a session refresh via `GET /apps/.../sessions/...`.
6. **Track progress**: the graph colours actors by status (pending/active/completed), the timeline expands phases/steps, and the summary card/metrics/log update as soon as workflow tools write into `session.state` (`workflow:plan`, `workflow:history`, `workflow:summary`, etc.).

## Structure

```
frontend/
├── index.html          # Shell layout and templates
├── styles.css          # Modern light theme styling
├── app.js              # Orchestrates UI state & events
├── api.js              # Thin wrapper for ADK REST endpoints
├── state.js            # Simple reactive store
├── utils.js            # Formatting & file helpers
├── graph.js            # SVG graph layout + status updates
├── timeline.js         # Workflow phase/step renderer
├── workflow.js         # State derivation helpers
└── data/
    ├── actors.js       # PVN actor metadata
    ├── relationships.js# Actor relationship edges
    └── workflows.js    # Embedded Quy chế 4281 workflow template
```

## Extending

- Add new workflows by placing their JSON definition in `pvn_digital_twin/workflows/` and mirroring the essential metadata inside `frontend/data/workflows.js` (or build a tiny loader endpoint to expose them dynamically).
- Extend the graph by enriching `actors.js` and `relationships.js` with additional nodes/edges or by consuming an API once the backend exposes structured organisation data.
- Hook in SSE streaming (`/run_sse`) by adapting `api.js` to consume Server-Sent Events and update the store incrementally.

## Troubleshooting

- **Connection badge stays red**: ensure `adk api_server` is running and reachable; check CORS errors in the browser console.
- **Run button disabled**: you need both a live session and an uploaded document.
- **No workflow data**: confirm that the VP agent actually called `load_workflow_plan`; use “Làm mới trạng thái” to pull the latest session.

This prototype is intentionally framework-free to stay portable. You can evolve it into a React/Vite/Next app by replacing the ES module entry points with component code while reusing the same API contract.
