# Bootstrap v6-dev Spike Checklist

Date: 2026-06-24
Purpose: Validate Bootstrap v6-dev value for the mesh monitor without risking production stability.

## Scope
- Keep a rollback-ready stable fallback build.
- Run Bootstrap v6-dev in an isolated branch pinned to a known commit.
- Measure visual, performance, and accessibility impact on core screens.

## Day 1 - Branch and Baseline
1. Create branch for v6 spike.
2. Capture baseline metrics on current branch:
   - bundle size
   - first contentful paint
   - interaction latency for node selection
   - fps under normal and burst profiles
3. Capture visual baseline screenshots for:
   - dashboard header
   - node grid card mode
   - node grid hex mode
   - sidebar forms
   - deferred topology panel

Exit criteria:
- Baseline report stored and reproducible.

## Day 2 - Upgrade and Compile
1. Upgrade Bootstrap dependency to the v6-dev branch snapshot in spike branch.
2. Rebuild shared style entrypoint and variable overrides.
3. Resolve compile and style token mismatches.
4. Keep all app feature flags unchanged.

Implementation note:
- Treat the spike as a commit-pinned source checkout, not a semver package install.

Exit criteria:
- App compiles and loads with no runtime blocker.

## Day 3 - Component and UX Validation
1. Validate high-impact components:
   - nav and controls
   - cards
   - forms
   - offcanvas/modal
   - utilities used in telemetry grid
2. Validate color mode and theme behavior.
3. Validate responsive behavior across mobile, tablet, desktop.

Exit criteria:
- No critical functional regressions in primary flows.

## Day 4 - Non-Functional Validation
1. Run lint, unit tests, e2e tests.
2. Run visual regression snapshots against baseline.
3. Run accessibility checks on key screens.
4. Repeat performance test set and compare deltas.

Exit criteria:
- Test and quality gates complete with clear pass/fail report.

## Day 5 - Decision and Rollback Readiness
1. Summarize gains, regressions, and unknowns.
2. Decide one of:
   - promote to preproduction branch
   - keep as innovation track only
   - defer until newer alpha/beta
3. Ensure rollback artifact for the stable fallback remains green.

Exit criteria:
- Decision memo and rollback path confirmed.

## Promotion Criteria
- No P1 or P2 regressions.
- Accessibility parity or improvement.
- Performance parity or improvement on node-heavy screens.
- No unresolved API instability affecting roadmap milestones.
- v6-dev snapshot remains pinned and reproducible.
