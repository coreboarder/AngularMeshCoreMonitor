# Traffic Connections Redesign Plan

Date: 2026-07-02
Owner: Mesh Monitor UI
Status: Proposed

## Why Redo Is Needed

Current traffic rendering is hard to read and not spatially reliable under responsive layout and high path density.

Observed technical issues in current implementation:
1. Node anchor math is index-based, not DOM-position-based, so line endpoints can drift from real node card centers.
2. Vertical coordinate normalization assumes a fixed row model and does not use actual rendered row count.
3. All paths use similar dashed animation, so direction and priority are not obvious at a glance.
4. Route semantics are collapsed into a single phase field, which is too limited for real traffic intent.
5. Overlay is non-interactive and lacks debugging affordances (hover trace, isolate route, congestion hints).

## Target Outcomes

1. Connections always start and end exactly at visible node anchors.
2. Direction of travel is immediately understandable in both low and high density views.
3. Relay chains and selected-node neighborhood can be isolated in one interaction.
4. Rendering stays smooth at 250 nodes with bursty updates.
5. Reduced-motion and high-contrast modes remain fully legible.

## Scope

In scope:
1. Path data model and derivation in simulation/state.
2. Connection layout engine and overlay rendering architecture.
3. Visual language for static topology vs live traffic.
4. Interaction model for trace, isolate, and inspect.
5. Performance, testing, and phased rollout.

Out of scope:
1. 3D hex visual mode redesign (unless needed for shared primitives).
2. Gateway transport protocol changes.

## Redesign Principles

1. Separate concerns: topology graph, route intent, and transient packet motion are distinct layers.
2. Anchor to rendered geometry: derive positions from actual DOM layout, not grid index heuristics.
3. Progressive density: clarity first at 20 paths, controlled aggregation at 200+ paths.
4. Deterministic rendering: stable edge identity and lane assignment prevent visual jitter.
5. Performance budget first: all animation decisions must pass frame-time budget targets.

## Proposed Architecture

### 1) Data Contract Upgrade

Introduce two concepts instead of one mixed path shape.

A. Topology edge (long-lived)
- edgeId
- fromNodeId
- toNodeId
- linkType (direct | relay)
- qualityScore (0-1)
- hopCount
- status (active | degraded | down)

B. Traffic flow event (short-lived)
- flowId
- edgeId or ordered routeEdgeIds[]
- bytesPerSec
- packetsPerSec
- latencyMs
- lossPct
- priority (low | normal | high | critical)
- direction (forward | reverse)
- startedAt / updatedAt

### 2) Anchor and Routing Engine

Implement a new layout utility in UI layer:
1. Measure node anchors using getBoundingClientRect relative to network container.
2. Recompute anchors with ResizeObserver + requestAnimationFrame batching.
3. Route edges with deterministic lane offsets per edge key to reduce overlap.
4. Use cubic bezier for short routes; segmented polyline fallback for heavy density.
5. Keep route cache keyed by edgeId and invalidate only on layout delta threshold.

### 3) Layered Rendering

Use a hybrid overlay:
1. SVG layer for stable topology strokes and accessible hit targets.
2. Canvas layer for high-frequency packet motion and pulse effects.
3. UI layer for labels, badges, and selection glow.

Visual encoding:
1. Topology: low-contrast, always-on skeleton.
2. Active flow: thicker stroke, directional gradient, moving pulse packets.
3. Degraded flow: amber/red tint and intermittent gaps.
4. Selected trace: non-selected edges dimmed to 20-30% opacity.

### 4) Interaction Model

1. Hover edge: show from/to labels, pps, latency, loss.
2. Click node: highlight 1-hop and 2-hop neighborhood.
3. Shift-click node: pin route inspector panel.
4. Toggle modes: Topology, Live Flow, Congestion Heatmap.
5. Add a path density slider to switch from individual flow to aggregated corridor mode.

### 5) Performance Strategy

Budgets:
1. <= 8 ms render work per frame at 60 fps target.
2. <= 2 layout recalculations per second during steady state.
3. <= 150 ms recovery to stable fps after burst update.

Tactics:
1. Throttle path recomputation with RAF + dirty-rect updates.
2. Move packet animation to canvas and avoid per-path DOM mutation.
3. Reuse Path2D objects and typed arrays for particle state.
4. Disable expensive effects in reduced mode or when fps drops below threshold.

### 6) Accessibility and Legibility

1. Do not rely on color alone for status; add stroke pattern variants.
2. Respect prefers-reduced-motion: replace moving particles with directional chevrons.
3. Ensure contrast minimum for warning/critical links against all theme backgrounds.
4. Add keyboard focus for nodes and connection summary cards.

## Delivery Phases

Phase 0 - Discovery and Baseline (0.5-1 day)
1. Capture screen recordings for current normal, burst, and degraded scenarios.
2. Log baseline fps, frame time, and route readability defects.
3. Finalize visual acceptance criteria with examples.

Phase 1 - Contracts and State (1-1.5 days)
1. Add topology edge and traffic flow contracts in domain models.
2. Update simulator to emit deterministic edges + flow events.
3. Adapt shell view model and state selectors.

Phase 2 - Anchor and Route Engine (1.5-2 days)
1. Build anchor measurement service.
2. Implement deterministic routing and lane offsets.
3. Add route cache and invalidation rules.

Phase 3 - Overlay Renderer (2-3 days)
1. Implement SVG topology layer.
2. Implement canvas packet layer.
3. Wire status and priority visual encodings.

Phase 4 - Interaction and Diagnostics (1-1.5 days)
1. Add hover/selection/isolation interactions.
2. Add mode toggles and density control.
3. Add metrics for dropped frames and route recompute counts.

Phase 5 - Hardening and Rollout (1-1.5 days)
1. Add unit tests for routing determinism and anchor mapping.
2. Add visual regression snapshots for low/medium/high density.
3. Gate behind feature flag (trafficOverlayV2), then default on after soak.

## Testing Plan

Unit tests:
1. Route generation is deterministic for same anchor set.
2. Lane offsets remain stable when unrelated nodes update.
3. Aggregation mode preserves direction and load semantics.

Component tests:
1. Selected node isolates expected neighbor routes.
2. Hovering edge shows correct metrics.
3. Reduced-motion mode swaps particle animation for static directional cues.

Performance tests:
1. 250 nodes, 400 active flows, normal mode.
2. Burst scenario with rapid flow churn.
3. 30-minute soak with memory and frame budget assertions.

## Acceptance Criteria

1. Endpoints visually align to node anchors on all breakpoints.
2. Direction and relay path are interpretable within 2 seconds for a new viewer.
3. Selected-node trace never highlights unrelated routes.
4. No sustained fps below 50 on Apple M2 baseline in normal mode.
5. All new tests pass in Nx test, lint, and build targets.

## Implementation Touchpoints

Likely files/libraries to update:
1. libs/mesh/domain-models/src/types.ts
2. libs/mesh/simulation/src/simulator.ts
3. apps/mesh-monitor/src/app-shell.ts
4. apps/mesh-monitor/src/render-dashboard.ts
5. libs/mesh/ui-grid/src/grid-layout.ts (if anchor helpers are colocated)
6. New rendering utilities in libs/mesh/ui-node or a new libs/mesh/traffic-visual library

## Risks and Mitigations

1. Risk: Canvas + SVG synchronization drift.
Mitigation: Single source of truth for anchors and route cache; shared timestamp tick.

2. Risk: Visual clutter at very high flow counts.
Mitigation: Adaptive aggregation and density-aware culling.

3. Risk: Reflow cost from frequent geometry reads.
Mitigation: Batched measurements and no read/write interleaving in same frame.

## Rollout Recommendation

1. Build behind trafficOverlayV2 feature flag.
2. Run side-by-side in internal demo mode for one sprint.
3. Promote to default once acceptance criteria and soak tests pass.
