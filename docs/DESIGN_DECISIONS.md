# DESIGN_DECISIONS.md

## Purpose

This document records architectural decisions that define Silent Film Sonific.
These decisions are considered project-level constraints and should not be changed
without explicit review.

---

## DD-001: Three-Layer Architecture

The system is divided into:

- Layer A — Video Analysis
- Layer B — Semantic / Musical Interpretation
- Layer C — Sound Generation

Layers communicate only through documented schemas and interfaces.

### Rationale

This allows independent replacement and testing of each layer.

---

## DD-002: Explicit Intermediate Representation

Layer A does not directly control sound.

Instead:

Video Features
→ Musical Interpretation
→ Sound Generation

### Rationale

This keeps the system modular and avoids hard-wired visual-to-audio mappings.

---

## DD-003: Live Performance First

The primary operating mode is real-time performance.

Offline rendering is supported but is not the primary design target.

---

## DD-004: Engine Independence

Layer C may be implemented using:

- Max/MSP synthesis
- External synthesizers
- MIDI devices
- VST instruments
- OSC-controlled systems

Layer B must remain independent of the selected sound engine.

---

## DD-005: Deterministic and Generative Modes

The architecture must support:

- deterministic behaviour
- probabilistic behaviour
- generative behaviour

The choice belongs to Layer C and must not require changes to Layer A.

---

## DD-006: Research Preservation

Research findings should be recorded in:

- docs/RESEARCH.md
- docs/research-notes/

Implementation decisions should be recorded here rather than embedded in code.
