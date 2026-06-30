# Explainer Review

Date: 2026-06-24
Input reviewed: Explainer.md + AngularMeshNetworkMonitor.png

## Executive Assessment
The concept is strong and demo-worthy for senior Angular engineers: real-time mesh telemetry, granular UI updates, and a performance narrative centered on modern Angular reactivity.

The current explainer needs tightening before implementation because it mixes concrete requirements with speculative framework claims and duplicated content.

## What Is Working Well
- Clear demo intent: a high-frequency, real-time network visualizer.
- Strong UX concept from the screenshot: matrix of nodes, active node configuration panel, hydration/performance indicators.
- Valuable technical angle: proving selective updates under heavy event flow.
- Good feature expansion idea: 3D hex node visuals with pulsing edges tied to live data.

## Gaps To Fix Before Build
- The document has duplicate sections (the rotation guidance appears twice).
- Several claims are citation-like but not implementation requirements.
- It does not define Nx workspace structure, app/lib boundaries, or task graph strategy.
- Backend simulation source is implied but not specified (WebSocket, SSE, worker, or mock HTTP polling).
- No acceptance criteria for frame-rate, latency, update throughput, or CPU ceiling.
- No i18n strategy for UI labels and telemetry copy.

## Recommended Requirement Rewrite (Short Form)
Use this as the source of truth for implementation:

1. Build an Nx monorepo with one Angular app and focused libraries for domain models, data stream simulation, node visualization, and shell/dashboard features.
2. Stream simulated MeshCore-like telemetry at configurable rates (default 20 Hz global, burst mode up to 60 Hz for subsets of nodes).
3. Render a 10x10 node grid where each node updates independently and can show a 3D hex visual state with pulsing edge intensity from signal metrics.
4. Provide a right-side configuration panel for selected node controls (tx power, hop limit, channel name) with immediate local update and simulated command round-trip feedback.
5. Include performance overlays (fps, dropped frames, event throughput, active nodes).
6. Support deferred loading for heavy topology/analytics panel.
7. Include internationalization keys for all UI copy and update all supported languages.
8. Include unit/integration/e2e tests and objective performance acceptance checks.

## Screenshot-Driven UI Notes
- Keep the current composition: command header, dense node matrix, operational sidebar.
- Preserve color semantics: green healthy, amber warning, red critical.
- Treat directional traffic flow as a hard design requirement: links must show where data is moving, which nodes are emitting, which nodes are relaying, and which nodes are receiving.
- Prefer visible route direction over purely decorative animation; motion must explain packet movement across the mesh.
- For the 3D hex node variant, animate only data-driven states (no decorative infinite spin).
- Keep a fallback 2D card mode for low-power devices or reduced-motion users.

## Risks
- Pushing CSS effects to all 100 nodes at high frequency can increase GPU cost.
- If updates are broadcast globally instead of per-node signal updates, rendering cost can spike.
- Simulated transport and UI state can drift without event IDs and deterministic clocks.

## Mitigations
- Batch event ticks and process by node partition.
- Use per-node signals/selectors and stable track keys.
- Add sequence numbers and client-side skew metrics.
- Add reduced-motion and quality modes (high, balanced, low).

## Definition of Ready
- Finalized event schema.
- Finalized UI modes: card and hex.
- Target metrics agreed: update rate, fps target, max CPU on reference machine.
- Translation locales list confirmed.
