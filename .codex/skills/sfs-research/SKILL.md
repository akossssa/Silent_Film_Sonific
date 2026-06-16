---
name: sfs-research
description: Research workflow for Silent Film Sonific. Use when investigating video-to-music systems, Max/MSP/Jitter techniques, adaptive music systems, semantic mapping, sonification, or architectural decisions.
---

# SFS Research Skill

## Purpose

This skill ensures that research strengthens the existing Silent Film Sonific
architecture rather than introducing accidental complexity.

---

## Architectural Context

The project follows:

Layer A → Layer B → Layer C

Where:

- Layer A = Video Analysis
- Layer B = Semantic / Musical Interpretation
- Layer C = Sound Generation

Research should reinforce this separation.

---

## Mandatory Reading

Before starting research read:

- AGENTS.md
- docs/RESEARCH.md
- docs/DESIGN_DECISIONS.md
- docs/CODEX_RESEARCH_WORKFLOW.md
- docs/REQUIREMENTS.md

---

## Research Procedure

1. Identify the missing knowledge.
2. Search authoritative sources.
3. Summarize findings.
4. Compare findings to existing project decisions.
5. Record findings.
6. Only then propose implementation changes.

---

## Recommended Source Types

Prefer:

- academic papers
- conference proceedings
- official documentation
- maintained open-source projects

Avoid basing design decisions solely on blog posts or forum discussions.

---

## Required Output

Every research note should include:

### Topic

What was investigated.

### Sources

Links and references.

### Findings

Objective summary.

### Relevance to Silent Film Sonific

Why it matters.

### Implementation Implications

Possible effects on:
- Layer A
- Layer B
- Layer C

### Recommendation

Adopt / Reject / Investigate Further

---

## Architectural Guardrails

Do NOT automatically introduce:

- direct video-to-audio mappings
- Layer A → Layer C shortcuts
- sound-engine-specific assumptions in Layer B

Research may inspire ideas, but implementation must respect project architecture.

---

## Documentation

Research results must be stored in:

docs/research-notes/

or merged into:

docs/RESEARCH.md
