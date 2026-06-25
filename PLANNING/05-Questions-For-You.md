# Questions For Final Refinement

Date: 2026-06-24

## Architecture and Operations
1. Should the production deployment include a separate mesh-stream-gateway service, or do you want a single deployable app with embedded gateway for now?
- lets use an embedded gateway for now

2. For real MeshCore integration, do you want serial-first, TCP-first, or both in milestone one?
- both please

3. What authentication model do you want for stream access in production (local token, API key, or enterprise SSO)?
- API embedded in the environment file for now. as it will only be run locally for the foresseable future.

## Scale and Performance Targets
1. Is 100 nodes the expected production baseline, or should we plan for 250+ nodes from day one?
- 250+ makes sense as we need the app to show how Angular can handle the data flow rates.

2. Do you want higher-frequency burst support than current plan (for example 100 Hz subsets)?
- yes

3. What is your reference hardware for acceptance testing (CPU/GPU class)?
- apple M2

## Product and UX
1. Which locales must be supported in v1 for full translation coverage?
EN, FR, RU, DE, IT, JP, CN, ES

2. Should hex mode be the default view, or card mode with an opt-in toggle?
- opt in toggle please

3. Do you want topology analytics panel available to all users or restricted to an advanced mode?
- all users

## Compliance and Security
1. Do you need telemetry event retention and audit history, or live-only streaming in v1?
- yes it shoul dbe tehre from the start

2. Are there data residency requirements for any persisted diagnostics?
- no

3. Should we include threat modeling and penetration test tasks in the initial roadmap?
- yes

## Bootstrap Direction
1. Are you comfortable using Bootstrap 5.3.8 now with a v6 migration branch later?
- no. it must be v6 in whatever version is available in the dev branch

2. Do you want strict Bootstrap-only primitives, or can we add small custom CSS for the 3D hex visuals where Bootstrap does not provide direct primitives?
- custom is allowed

## Decision Summary
- Embedded gateway for now.
- Serial and TCP both in milestone one.
- Local environment-file API key for stream access.
- 250+ node target.
- Higher-frequency burst support enabled.
- Reference hardware: Apple M2.
- Locales: EN, FR, RU, DE, IT, JP, CN, ES.
- Hex mode is opt-in.
- Topology analytics available to all users.
- Telemetry retention and audit history included from the start.
- Threat modeling and penetration testing included in the roadmap.
- Bootstrap baseline must follow the v6-dev branch.
- Custom CSS is allowed where Bootstrap primitives are insufficient.
