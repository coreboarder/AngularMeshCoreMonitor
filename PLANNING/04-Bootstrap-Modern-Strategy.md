# Bootstrap Modern Strategy for This Project

Date: 2026-06-24

## Verified Version Reality
- Latest verified stable release in current sources: Bootstrap 5.3.8.
- Bootstrap 6 has an active development branch (v6-dev) and alpha package references (6.0.0-alpha1).
- Latest GitHub releases still show v5.3.8 as latest stable.

## Recommendation
Use Bootstrap v6-dev as the project baseline.

Because v6-dev is a development branch rather than a stable release, keep the implementation pinned to a known branch/commit snapshot and treat the current Bootstrap 5.3.8 knowledge as fallback only.

## Bleeding-Edge Features You Can Use Today
1. Color modes with runtime switching:
   - Use data-theme mode switching for operations context (day, night, diagnostic).
2. CSS variable first theming:
   - Drive panel and node status styling with component-scoped CSS variables.
3. Utility API custom utilities:
   - Generate mesh-specific utility classes (signal intensity tiers, density modes, glow strength).
4. Selective JavaScript module usage:
   - Import only needed Bootstrap modules to keep payload lean.
5. Offcanvas + modal operational flows:
   - Offcanvas for command console; modal for critical confirmation actions.
6. Bootstrap Icons latest set:
   - Use consistent iconography for role, health, route depth, and connectivity.

## Production Guardrails
- Do not rely on undocumented internals.
- Keep customizations in a dedicated theme layer in shared UI styles.
- Add visual regression checks for all color modes and density variants.
- Ensure WCAG contrast in all status colors and states.
- If using v6-dev, do not ship without a rollback-ready stable build artifact and a frozen commit reference.

## V6-Readiness Checklist
1. Avoid legacy/deprecated patterns and custom hacks.
2. Centralize all Bootstrap variable overrides in one theme entrypoint.
3. Keep bootstrap JS integrations wrapped behind Angular services/directives.
4. Maintain compatibility test matrix for Chrome, Firefox, Safari.
5. Reserve a dedicated v6-dev branch or pinned commit for diff review.
6. Snapshot CSS output and critical component behavior before and after upgrade.

## Integration Plan in Nx
- shared style package owns Bootstrap import and variable overrides.
- feature libraries consume semantic design tokens, not raw hard-coded colors.
- dashboard modes map to semantic tokens so visual upgrades are low risk.

## Decision Point
Near-term option:
- Track Bootstrap directly from the v6-dev branch and pin to a known commit for the demo baseline.

Promotion criteria:
- Full lint/test/e2e and visual regression green.
- No accessibility regressions.
- No measurable performance regressions in node grid and sidebar interactions.
- Clear rollback path to a stable fallback build.
