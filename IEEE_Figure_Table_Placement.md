# Figure and Table Placement Plan (IEEE Article)

## Scope

This document defines exactly where figures and tables should be placed in the article.  
Figures include:
- Mermaid diagrams (required)
- Product screenshots (where needed)

Tables include:
- Requirement tables
- Architecture/component mapping
- Security and evaluation matrices

---

## Placement Rules

1. Place each figure/table immediately after its first technical mention.
2. Keep figure captions concise and task-oriented.
3. For screenshots, include only UI areas directly relevant to the section claim.
4. Avoid placing more than 2 large figures back-to-back without explanatory text.
5. In IEEE layout, keep wide tables in appendices if they exceed column width.

---

## Main Body Figure Plan

## Figure 1 (Mermaid)
- **Section:** 3. One-Minute Product Flow
- **Placement:** Right after first paragraph describing end-to-end workflow
- **Type:** Mermaid flowchart
- **Caption:** "End-to-end SiteScribe workflow from evidence ingestion to export delivery."

## Figure 2 (Screenshot)
- **Section:** 3. One-Minute Product Flow
- **Placement:** Immediately after Figure 1
- **Type:** Product screenshot
- **Insert screenshot:** (Project workflow pages from `/projects/[id]`: evidence, signals, search, templates, exports)
- **Caption:** "Project-level navigation and operational modules."

## Figure 3 (Mermaid)
- **Section:** 5. System Architecture
- **Placement:** After architecture overview paragraph
- **Type:** Mermaid layered architecture diagram
- **Caption:** "Logical system architecture and service boundaries."

## Figure 4 (Screenshot)
- **Section:** 5. System Architecture
- **Placement:** After Figure 3
- **Type:** Repository screenshot
- **Insert screenshot:** (Code structure showing `app/`, `lib/`, `prisma/`, `components/`)
- **Caption:** "Implementation structure of SiteScribe codebase."

## Figure 5 (Mermaid)
- **Section:** 6. Data Model and Domain Semantics
- **Placement:** After first paragraph introducing data model
- **Type:** Mermaid ER diagram
- **Caption:** "Domain entity relationships for multi-tenant evidence-to-CO workflow."

## Figure 6 (Screenshot)
- **Section:** 8. Evidence Pipeline in Detail
- **Placement:** After subsection 8.1/8.2 explanation
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/evidence` upload form + evidence list)
- **Caption:** "Evidence ingestion interface and persisted evidence records."

## Figure 7 (Screenshot)
- **Section:** 8. Evidence Pipeline in Detail
- **Placement:** After subsection 8.3 explanation
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/evidence/links`)
- **Caption:** "Evidence relationship management across documents."

## Figure 8 (Screenshot)
- **Section:** 8. Evidence Pipeline in Detail
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/evidence/compare`)
- **Caption:** "Plan revision side-by-side comparison workspace."

## Figure 9 (Mermaid)
- **Section:** 9. Signal Detection and Event Formation
- **Placement:** After AI enrichment subsection intro
- **Type:** Mermaid sequence diagram
- **Caption:** "Signal detection and optional enrichment interaction sequence."

## Figure 10 (Screenshot)
- **Section:** 9. Signal Detection and Event Formation
- **Placement:** After Figure 9
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/signals` after detection)
- **Caption:** "Signals and events triage board."

## Figure 11 (Mermaid)
- **Section:** 10. Change Order Generation and Lifecycle
- **Placement:** After lifecycle explanation
- **Type:** Mermaid state diagram
- **Caption:** "Change Order lifecycle states and transitions."

## Figure 12 (Screenshot)
- **Section:** 10. Change Order Generation and Lifecycle
- **Placement:** After draft generation subsection
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/events/[eventId]` with Generate CO action)
- **Caption:** "Event detail and Change Order draft trigger."

## Figure 13 (Screenshot)
- **Section:** 10. Change Order Generation and Lifecycle
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/co/[coId]` editor + line items + comments)
- **Caption:** "Change Order editing and collaboration interface."

## Figure 14 (Screenshot)
- **Section:** 11. Search and Retrieval Strategy
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/search` semantic + full-text results)
- **Caption:** "Hybrid retrieval interface with lexical and semantic results."

## Figure 15 (Mermaid)
- **Section:** 12. Export Integrity and Delivery
- **Placement:** After manifest model explanation
- **Type:** Mermaid flow diagram
- **Caption:** "Export generation pipeline and manifest assembly."

## Figure 16 (Screenshot)
- **Section:** 12. Export Integrity and Delivery
- **Placement:** After Figure 15
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/exports`)
- **Caption:** "Export job list and artifact access."

## Figure 17 (Screenshot)
- **Section:** 12. Export Integrity and Delivery
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (`/projects/[id]/scheduled-exports`)
- **Caption:** "Scheduled export configuration and management."

## Figure 18 (Mermaid)
- **Section:** 13. Notifications, Webhooks, and Team Collaboration
- **Placement:** After webhook subsection
- **Type:** Mermaid sequence diagram
- **Caption:** "Notification and webhook delivery interaction."

## Figure 19 (Screenshot)
- **Section:** 13. Notifications, Webhooks, and Team Collaboration
- **Placement:** After Figure 18
- **Type:** UI screenshot
- **Insert screenshot:** (`/notifications`)
- **Caption:** "In-app notifications center."

## Figure 20 (Screenshot)
- **Section:** 13. Notifications, Webhooks, and Team Collaboration
- **Placement:** After notifications screenshot
- **Type:** UI screenshot
- **Insert screenshot:** (`/org/webhooks?org=<id>`)
- **Caption:** "Organization-level webhook management."

## Figure 21 (Screenshot)
- **Section:** 13. Notifications, Webhooks, and Team Collaboration
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (`/friends` and `/chat`)
- **Caption:** "Collaboration layer: friend graph and direct messaging."

## Figure 22 (Mermaid)
- **Section:** 14. Security Model
- **Placement:** After defense-in-depth bullets
- **Type:** Mermaid control-flow diagram
- **Caption:** "Security control flow from request to audited action."

## Figure 23 (Screenshot)
- **Section:** 15. Localization and UX Readiness
- **Placement:** End of section
- **Type:** UI screenshot
- **Insert screenshot:** (Language switcher and localized UI example)
- **Caption:** "Localization-aware interface and multilingual presentation."

## Figure 24 (Mermaid)
- **Section:** 17. Zenodo and DOI Publication Strategy
- **Placement:** After DOI strategy explanation
- **Type:** Mermaid flow diagram
- **Caption:** "Release-to-DOI publication workflow with concept/version DOI."

---

## Main Body Table Plan

## Table 1
- **Section:** 4. Requirements Engineering
- **Placement:** After FR/NFR text introduction
- **Title:** "Functional and Non-Functional Requirements Summary"

## Table 2
- **Section:** 6. Data Model and Domain Semantics
- **Placement:** After ER diagram and before role policy narrative
- **Title:** "Core Entities, Scope, and Governance Responsibilities"

## Table 3
- **Section:** 7. Access Control and Multi-Tenancy
- **Placement:** After role hierarchy paragraph
- **Title:** "Role-Permission Matrix for Key Operations"

## Table 4
- **Section:** 12. Export Integrity and Delivery
- **Placement:** After manifest explanation
- **Title:** "Manifest Fields and Integrity Semantics"

## Table 5
- **Section:** 14. Security Model
- **Placement:** After security control overview
- **Title:** "Security Control Mapping (OWASP/NIST/Protocol)"

## Table 6
- **Section:** 17. Testing and Quality Strategy
- **Placement:** After metric discussion
- **Title:** "Evaluation Metrics and Measurement Definitions"

## Table 7
- **Section:** 19. Known Limitations and Future Work
- **Placement:** End of section
- **Title:** "Limitation-to-Mitigation Roadmap"

---

## Appendix Figure Plan

## Figure A1 (Mermaid)
- **Appendix:** Reproducibility
- **Type:** Mermaid flowchart
- **Caption:** "Reproducible artifact packaging lifecycle."

## Figure A2 (Mermaid)
- **Appendix:** Threat Model
- **Type:** Mermaid diagram
- **Caption:** "Threat model overview and control placement."

## Figure A3 (Screenshot, optional)
- **Appendix:** Reproducibility
- **Insert screenshot:** (Repository release/tag page prepared for Zenodo)
- **Caption:** "Release artifact snapshot used for DOI archival."

---

## Appendix Table Plan

## Table A1
- **Appendix:** Reproducibility
- **Title:** "Artifact Checklist for Zenodo DOI Release"

## Table A2
- **Appendix:** Extended Evaluation
- **Title:** "Full Metric Catalog (Primary/Secondary Metrics)"

## Table A3
- **Appendix:** Security
- **Title:** "STRIDE Risk Register with Mitigation Status"

## Table A4
- **Appendix:** Traceability
- **Title:** "Requirement-to-Module-to-Test Traceability Matrix"

---

## Final Layout Recommendation (IEEE Two-Column)

1. Keep architecture and ER diagrams full-width if possible.
2. Use one screenshot per key section, not per paragraph.
3. Move dense matrices (role matrix, risk register, traceability matrix) to appendices.
4. Keep main body to decision-relevant visuals; relegate diagnostic visuals to appendices.
5. Ensure every figure/table is explicitly referenced in text before it appears.
