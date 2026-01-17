# Phase 1: Identity - Context

**Gathered:** 2026-01-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can identify themselves with a passphrase that persists on their device. Includes initial entry, localStorage persistence, and ability to change passphrase from settings. Game persistence and history are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Settings experience
- Access via tapping a profile/avatar area (not gear icon or menu)
- Avatar placeholder represents user identity (no passphrase text displayed)
- Settings appears as modal/sheet overlay, not full page navigation
- Changing passphrase requires typing new passphrase twice to confirm

### Claude's Discretion
- Passphrase entry flow (modal vs page, first-time vs returning user)
- Passphrase format and validation (length, format, strength indicators)
- Error and edge case handling (forgotten passphrase, empty input, localStorage unavailable)
- Avatar placeholder design/icon choice
- Modal/sheet animation and styling

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for areas not discussed.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-identity*
*Context gathered: 2026-01-17*
