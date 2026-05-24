# Validation Report — Windows Focus App PRD

- **PRD:** `windows_focus_app_prd.md`
- **Rubric:** `assets/prd-validation-checklist.md`
- **Run at:** 2026-05-24T00:07:47+01:00
- **Grade:** Fair

## Overall verdict
The Windows Focus App PRD establishes a very clear, focused, and minimal product vision. It excels at avoiding "theater" by setting concrete performance NFRs (e.g., <1s startup, <150MB RAM) and maintaining a strict capability-spec shape appropriate for a single-operator desktop tool. However, the PRD relies heavily on subjective adjectives for acceptance criteria and lacks measurable success metrics, making it difficult for downstream engineering to know when a feature is truly "done". 

## Dimension verdicts
- Decision-readiness — adequate
- Substance over theater — strong
- Strategic coherence — adequate
- Done-ness clarity — thin
- Scope honesty — adequate
- Downstream usability — adequate
- Shape fit — strong

## Findings by severity

### High (2)
**[Strategic coherence]** — Unmeasurable Success Metrics (§ Success Criteria)
The success criteria include "feel calmer while working" and "enjoy opening the app." While these align with the vision, they are not quantifiable or testable.
Fix: Define quantitative proxies (e.g., higher session completion rates, fewer pauses) or explicit qualitative mechanisms (e.g., day-7 retention, user surveys).

**[Done-ness clarity]** — Subjective Acceptance Criteria (§ UX Goals, § Animations)
The PRD is filled with adjectives like "ultra smooth", "calming gradients", "elegant typography", and "soft motion." An engineer cannot test for "calming."
Fix: Replace adjectives with specific bounds (e.g., "transitions must be exactly 300ms using ease-in-out," "use exactly one accent color from a predefined muted palette").

### Medium (2)
**[Decision-readiness]** — Missing Edge Cases and Trade-offs (§ Timer Logic Requirements)
The PRD states what to build, but smooths over potential trade-offs (e.g., local storage vs privacy, handling app crashes during a session, or what happens if the user manually changes system time). 
Fix: Add an explicitly labeled "Open Questions" or "Trade-offs" section to document these tensions and acknowledge edge-case handling.

**[Downstream usability]** — Missing Feature IDs (§ MVP Features)
The features are listed as bullet points (e.g., Focus Timer, Session History) but lack stable, unique identifiers.
Fix: Assign stable IDs to each feature (e.g., `FR-01: Focus Timer`) so downstream architecture and user stories can cross-reference them without ambiguity.

### Low (1)
**[Scope honesty]** — Missing Explicit Assumptions (§ Non-Goals)
While Non-Goals are well-defined, there are no documented assumptions about user behavior or the operating system environment.
Fix: Add an `[ASSUMPTION]` section detailing prerequisites, such as "Assuming users have native notifications enabled in Windows settings."

## Mechanical notes
- ID continuity: Missing FR IDs across the document.
- Glossary: Missing a glossary. Terms like "Focus session" and "Break mode" should be strictly defined.
