# Nx + Angular 22 Implementation Plan

Date: 2026-06-24
Scope: Build a production-quality Angular 22 mesh monitor in an Nx monorepo, initially backed by a simulated MeshCore telemetry stream, with a clean path to real MeshCore device integration.

UI framework baseline: Bootstrap v6-dev pinned to a known commit snapshot, with a stable fallback build available for rollback.

## 1. Outcomes
- Real-time dashboard with 250+ nodes and node-level selective rendering.
- Directional traffic visualization showing packet movement, relays, route direction, and active source/destination nodes.
- Simulated transport service that emits realistic traffic patterns.
- Two node visual modes: standard card and 3D hex with pulse lines.
- Clear performance instrumentation and demo script for senior engineers.
- Production-ready boundaries so simulator transport can be replaced by real MeshCore stream adapters without UI rewrites.
- Operational quality targets: observability, resilience, security hardening, and CI quality gates.

## 2. Nx Workspace Strategy
Reference sections consulted:
- Nx Angular app generator: nx g @nx/angular:app apps/appName
- Nx Angular library generator: nx g @nx/angular:lib libs/libName
- Nx app targets: serve, build, test, lint, e2e
- Vitest execution in Nx: nx test <project>

Proposed project layout:
- apps/mesh-monitor
- apps/mesh-stream-gateway
- libs/mesh/domain-models
- libs/mesh/simulation
- libs/mesh/stream-contracts
- libs/mesh/transport-client
- libs/mesh/transport-server
- libs/mesh/state
- libs/mesh/ui-node
- libs/mesh/ui-grid
- libs/mesh/feature-dashboard
- libs/shared/i18n
- libs/shared/perf
- libs/shared/security
- libs/shared/observability

Dependency direction:
- feature-dashboard -> state + ui-grid + ui-node + shared/perf + shared/i18n
- state -> domain-models + simulation + stream-contracts + transport-client
- ui-grid/ui-node -> domain-models + shared/i18n
- simulation -> domain-models + stream-contracts
- transport-client -> stream-contracts + shared/security
- transport-server -> stream-contracts + shared/security + shared/observability

Rationale:
- Keep stream contracts in a dedicated library for strict compatibility between simulator, gateway, and app.
- Isolate real device integration behind transport adapters.
- Keep UI free of protocol-specific concerns.

## 3. Phased Plan

### Phase A - Bootstrap (Day 1)
1. Create Nx workspace and Angular app.
2. Generate core libraries listed above.
3. Set up path aliases and enforce boundary rules.
4. Add baseline CI targets: lint, test, build.
5. Add conventional commit and branch protection checks in CI.

Exit criteria:
- All projects build and tests run through Nx targets.

### Phase B - Domain + Simulation (Day 1-2)
1. Define telemetry schema:
   - Node identity, role, battery, link quality, signal strength, packet counters, route depth, status.
   - Event envelope with sequence id, timestamp, node id, event type, payload.
2. Build simulation engine in libs/mesh/simulation:
   - Tick scheduler with adjustable refresh interval.
   - Profiles: idle, normal, burst, degraded.
   - Deterministic seed mode for repeatable demos/tests.
3. Expose simulation API from libs/mesh/state:
   - Start, stop, change profile, set node count, inject anomaly.

4. Create stream contracts library:
   - Versioned event schema.
   - Backward-compatible envelope policy.
   - Contract validation guards.

Exit criteria:
- Stream can drive 100 nodes at 20 Hz with deterministic replay option.
- Contract tests validate simulator output against stream contracts.

### Phase B2 - Gateway + Real Stream Readiness (Day 2)
1. Build stream gateway app in apps/mesh-stream-gateway:
   - Ingest from simulator first.
   - Expose WebSocket stream for UI.
2. Define adapter interfaces for real MeshCore sources:
   - serial adapter.
   - tcp adapter.
3. Add resilience features:
   - reconnect with exponential backoff.
   - heartbeat and stale stream detection.
   - bounded queues and backpressure handling.
4. Wire local configuration through environment variables:
   - local API key loaded from environment file.
   - serial and TCP connection settings.

Exit criteria:
- UI can consume stream via gateway WebSocket independent of source type.

### Phase C - Angular UI Shell (Day 2-3)
1. Build dashboard shell in libs/mesh/feature-dashboard:
   - Header controls (polling toggle, profile, refresh rate).
   - Grid area (100 nodes).
   - Sidebar (selected node config + mini charts).
2. Build ui-grid and ui-node libs:
   - Stable keyed rendering for each node.
   - Visual state tokens (healthy/warn/critical).
3. Add directional traffic overlays and routed link paths between nodes.
4. Add deferred panel for heavy topology analytics.
5. Integrate Bootstrap 5.3.8 theming layer with CSS variables and color modes.

Exit criteria:
- Functional dashboard with clear parity to screenshot layout and visible traffic direction between nodes.
- Layout remains responsive at 320px, tablet, and desktop breakpoints.

### Phase D - 3D Hex Node Mode (Day 3-4)
1. Build hex component in libs/mesh/ui-node:
   - Hex body using CSS transforms and layered pseudo-elements.
   - Pulsing edge lines mapped to live signal/link metrics and flow direction.
2. Add mode toggle:
   - Card mode.
   - Hex mode.
   - Reduced-motion fallback.
3. Keep animation data-driven (no decorative constant spin).
4. Use pulse direction, intensity, and offset to indicate traffic origin, relay, and destination.
5. Add user preference for reduced motion and persist setting.

Exit criteria:
- Hex visuals respond to telemetry, show directional traffic, and remain performant with 100 nodes.

### Phase E - Performance + Diagnostics (Day 4)
1. Implement perf instrumentation in libs/shared/perf:
   - fps counter.
   - event throughput/s.
   - render/update counters.
2. Add debug panel with quality presets:
   - high, balanced, low.
3. Add stress scenarios:
   - burst traffic.
   - packet loss.
   - intermittent node failures.

4. Add OpenTelemetry-compatible instrumentation hooks in shared observability layer.

Exit criteria:
- Metrics visible and stable under defined scenarios.
- Structured logs include stream source, sequence lag, dropped events, and reconnect counts.

### Phase F - i18n + Testing + Demo Hardening (Day 5)
1. Move all UI copy to translation keys.
2. Update all supported locale files for any new/changed copy.
3. Add tests:
   - Unit tests for simulation and state derivations.
   - Component tests for node update isolation.
   - E2E flow for selecting node and applying config.
4. Build final demo script:
   - normal mode -> burst mode -> hex mode -> deferred panel reveal.

5. Add security baseline:
   - input/schema validation at gateway.
   - origin policy and auth placeholder for protected streams.
   - dependency audit in CI.

Exit criteria:
- Tests pass, localized copy complete, demo script reproducible.
- CI passes quality gates (lint, tests, coverage threshold, build, dependency audit).

## 4. Suggested Implementation Commands
Use these as a baseline and adjust names to final conventions.

- nx g @nx/angular:app apps/mesh-monitor
- nx g @nx/node:app apps/mesh-stream-gateway
- nx g @nx/angular:lib libs/mesh/domain-models
- nx g @nx/angular:lib libs/mesh/simulation
- nx g @nx/js:lib libs/mesh/stream-contracts
- nx g @nx/js:lib libs/mesh/transport-client
- nx g @nx/js:lib libs/mesh/transport-server
- nx g @nx/angular:lib libs/mesh/state
- nx g @nx/angular:lib libs/mesh/ui-node
- nx g @nx/angular:lib libs/mesh/ui-grid
- nx g @nx/angular:lib libs/mesh/feature-dashboard
- nx g @nx/angular:lib libs/shared/i18n
- nx g @nx/angular:lib libs/shared/perf
- nx g @nx/js:lib libs/shared/security
- nx g @nx/js:lib libs/shared/observability

Run targets:
- nx serve mesh-monitor
- nx serve mesh-stream-gateway
- nx build mesh-monitor
- nx test mesh-monitor
- nx lint mesh-monitor
- nx e2e mesh-monitor

## 5. Architecture Notes
- Keep transport behind a source adapter interface so simulator, serial, and TCP can be swapped.
- Separate domain model updates from visual interpolation logic.
- Use immutable event envelopes and explicit reducer-style application of updates.
- Favor local, node-scoped reactivity over global object replacement.
- Process and validate all inbound events before state application.
- Use sequence IDs and monotonic timestamps to handle ordering and lag.
- Introduce feature flags for experimental visuals and transport modes.

## 6. Bootstrap Strategy (Bleeding Edge, Practical)

Current validated baseline:
- Bootstrap 5.3.8.

Bootstrap 6 beta status:
- Not currently available in verified public sources during this planning pass.

Production strategy:
1. Build on 5.3.8 now.
2. Use v6-friendly patterns (CSS variable first theming, no deprecated patterns).
3. Keep a dedicated upgrade checklist and compatibility matrix.

High-value modern Bootstrap features to use now:
- Color modes driven by data-theme with runtime toggles.
- Component-scoped CSS variable customization for live telemetry themes.
- Utility API to generate project-specific utilities for density, glow intensity, and status emphasis.
- Bootstrap JavaScript modules imported selectively to avoid unused JS.
- Offcanvas and modal patterns for diagnostics and command workflows.
- Latest Bootstrap Icons set for operational status iconography.

Planned upgrade trigger:
- When v6 beta is released, run a dedicated branch migration with visual regression tests and contract snapshots.

## 7. Performance Acceptance Criteria
- At 250+ nodes, normal profile: target 55+ fps on Apple M2 reference hardware.
- Burst profile: support 100 Hz subsets without sustained UI freeze over 200 ms.
- Node selection and config edit interaction latency: under 50 ms perceived response.
- Debug overlays can be disabled in production build profile.
- End-to-end event latency (gateway receive to UI update): target p95 under 120 ms.
- No unbounded memory growth over a 30-minute soak run.

## 8. Demo Narrative (5 Minutes)
1. Start in card mode with normal traffic.
2. Show selective node updates, active relays, and config edits.
3. Switch to burst mode and enable perf overlay while packet direction remains visible.
4. Toggle to 3D hex mode and show pulse response to routed traffic.
5. Scroll to deferred topology panel and show delayed loading behavior.

## 9. Open Decisions
- Final list of supported locales.
- Final event rate caps per quality mode.
- Whether to include SSR for initial shell load or keep SPA for demo simplicity.
- Whether to expose simulation controls publicly or behind a debug flag.
- Authentication model for real stream access (local token vs enterprise SSO).
- Data retention policy for telemetry snapshots and diagnostics.
- Bootstrap v6-dev branch pin and rollback fallback verification.
