# CODEX_RESEARCH_WORKFLOW.md

## Purpose

This document defines how Codex should perform research for Silent Film Sonific.

The goal is to improve project knowledge without disrupting the existing
implementation workflow.

---

## Core Principle

Research must support the project architecture:

Layer A → Layer B → Layer C

Research must not introduce direct coupling between Layer A and Layer C.

---

## Before Starting Research

Read:

- AGENTS.md
- docs/REQUIREMENTS.md
- docs/RESEARCH.md
- docs/DESIGN_DECISIONS.md

Understand the current architecture before proposing changes.

---

## Research Trigger Conditions

Perform research when:

- a new architectural decision is required;
- a new video-analysis technique is proposed;
- a new semantic interpretation model is proposed;
- a new music-generation approach is proposed;
- a new external integration is proposed.

Do not perform research for routine bug fixes.

---

## Research Output Format

Research findings should contain:

### Source

Title:
URL:
Date accessed:

### Summary

Short summary of findings.

### Relevance

Why this is relevant to Silent Film Sonific.

### Implementation Implications

Possible effects on:
- Layer A
- Layer B
- Layer C

### Recommendation

Adopt / Reject / Investigate Further

---

## Preferred Research Topics

### Video Analysis

- cv.jit
- Jitter
- optical flow
- motion segmentation
- object tracking
- scene change detection

### Semantic Interpretation

- adaptive music systems
- game audio architectures
- semantic event extraction
- emotional state estimation
- temporal event detection

### Sound Generation

- Max/MSP synthesis
- MIDI orchestration
- OSC control
- external synthesizers
- generative music systems

---

## Documentation Rule

Research must be saved into:

docs/research-notes/

or incorporated into:

docs/RESEARCH.md

Research should not exist only inside Codex conversations.

---

## Design Rule

Facts obtained from research are not automatically design decisions.

Design decisions must be recorded separately in:

docs/DESIGN_DECISIONS.md
