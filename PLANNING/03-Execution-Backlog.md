# Execution Backlog

Date: 2026-06-24

## Sprint 1 - Foundation
1. Create Nx workspace and app shell.
2. Generate mesh, transport, and shared libraries.
3. Implement domain models and event contracts.
4. Implement base simulator with deterministic seed.
5. Add initial dashboard layout and node grid placeholders.
6. Configure CI quality gates (lint, test, build, dependency audit).

## Sprint 2 - Real-Time UX
1. Wire simulator stream through gateway into state facade.
2. Render live node cards with status and counters.
3. Add selected node config panel.
4. Add profile controls (idle/normal/burst/degraded).
5. Add perf HUD (fps and events/s).
6. Implement reconnect, heartbeat, and stale-stream UI indicators.
7. Add routed traffic paths, directional arrows, and source-to-relay-to-destination highlighting.

## Sprint 3 - Visual Power Demo
1. Implement 3D hex node renderer.
2. Implement data-driven edge pulse animation with visible direction of travel.
3. Add quality modes and reduced-motion fallback.
4. Add deferred topology panel.
5. Add scenario scripts for packet loss and node dropouts.
6. Add visual regression snapshots for card and hex modes.

## Sprint 4 - Hardening
1. Internationalize all UI copy with translation keys.
2. Update all supported locale files.
3. Add unit tests for simulator and reducers.
4. Add component tests for node-level update isolation.
5. Add E2E test for config edit and stream continuity.
6. Add contract tests for stream schema compatibility.
7. Add 30-minute soak tests and memory assertions.

## Demo-Readiness Checklist
- 100-node grid stable at target update rates.
- No memory growth during 30-minute run.
- Clear visual distinction for healthy/warn/critical states.
- Traffic flow direction is obvious at a glance across the mesh.
- Selected node can be traced to its relays and downstream receivers.
- Hex mode can be toggled on/off at runtime.
- Deferred panel behavior demonstrated on demand.
- Test, lint, build targets green in Nx.
- Gateway source can be switched from simulator to adapter without UI code changes.
