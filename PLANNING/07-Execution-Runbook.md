# Execution Runbook

Date: 2026-06-24
Purpose: Turn the approved plan into a deterministic build order for the Nx + Angular 22 MeshCore monitor.

## Build Order

### Step 1 - Workspace Foundation
1. Create the Nx workspace.
2. Create the Angular app for the dashboard.
3. Create the embedded gateway app or server entrypoint inside the same deployment unit.
4. Generate domain, simulation, contract, UI, perf, security, and observability libraries.
5. Add workspace linting, boundary rules, and formatting.

### Step 2 - Bootstrap v6-dev Baseline
1. Pin Bootstrap to the v6-dev branch snapshot.
2. Add Bootstrap theme entrypoint with CSS variable overrides.
3. Add color modes and semantic status tokens.
4. Add a rollback-ready stable fallback build artifact.
5. Verify the dashboard shell compiles with the new theme layer.

### Step 3 - Stream Contracts and Simulation
1. Define the telemetry event schema.
2. Implement validation guards for stream payloads.
3. Build the deterministic simulator.
4. Add profiles for idle, normal, burst, and degraded.
5. Add sequence numbers and timestamps for ordering and latency checks.

### Step 4 - Embedded Gateway
1. Implement the embedded gateway.
2. Add both serial and TCP adapters.
3. Read local API credentials from the environment file.
4. Expose a WebSocket stream to the Angular app.
5. Add reconnect, heartbeat, queue bounds, and stale stream detection.

### Step 5 - UI Shell and Grid
1. Build the dashboard shell.
2. Render the 250+ node grid with stable keyed updates.
3. Add the selected node sidebar.
4. Add topology analytics panel for all users.
5. Add responsive behavior for mobile, tablet, and desktop.

### Step 6 - Hex Visual Mode
1. Build the 3D hex node component.
2. Add pulsing edge effects tied to live telemetry.
3. Keep hex mode opt-in.
4. Add reduced-motion fallback.
5. Keep custom CSS isolated to the visual layer.

### Step 7 - Performance and Diagnostics
1. Add fps, throughput, render, and latency metrics.
2. Add soak test scenarios for 250+ nodes and 100 Hz bursts.
3. Add OpenTelemetry-compatible hooks.
4. Add structured logging for reconnects, lag, and dropped events.

### Step 8 - Security, Retention, and Compliance
1. Add gateway input validation.
2. Add placeholder auth gating for local-only access.
3. Add telemetry retention and audit history storage.
4. Add threat modeling tasks.
5. Add penetration test tasks.

### Step 9 - Internationalization and Hardening
1. Move all copy to translation keys.
2. Add locale files for EN, FR, RU, DE, IT, JP, CN, and ES.
3. Add unit, component, and e2e tests.
4. Add visual regression coverage.
5. Verify build, lint, test, and dependency audit in CI.

## Recommended First Commands
1. Create workspace.
2. Generate app and libraries.
3. Install or link Bootstrap v6-dev snapshot.
4. Set up the theme entrypoint.
5. Implement stream contracts and simulator first.

## Definition of Done
- The app can render 250+ nodes on Apple M2 baseline hardware.
- The embedded gateway can stream simulated traffic and is ready for serial and TCP adapters.
- Bootstrap v6-dev is pinned and reproducible.
- Hex mode works as an opt-in visual variant.
- All supported locales are wired.
- Security, retention, and test gates are in place.
