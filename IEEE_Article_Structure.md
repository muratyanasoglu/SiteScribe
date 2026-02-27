# SiteScribe Academic Article Structure (IEEE-Style Blueprint)

## 0. Front Matter

### 0.1 Title
- Full technical title
- Optional subtitle (scope/domain)

### 0.2 Authors and Affiliations
- Author name(s)
- Role(s), institution/company
- Contact information

### 0.3 Acknowledgment
- Mentor/supervisor acknowledgment
- Funding/support (if any)

### 0.4 Abstract
- Problem context
- Proposed system/method
- Key contributions
- High-level findings/expected outcomes

### 0.5 Index Terms
- 6-12 keywords (domain + technical + methodological)

---

## 1. Introduction

### 1.1 Domain Background
- Construction change-order challenge
- Why evidence fragmentation is costly

### 1.2 Problem Statement
- Current workflow limitations
- Gaps in traceability, speed, and auditability

### 1.3 Motivation
- Practical pain points
- Why existing tools/workflows are insufficient

### 1.4 Research/Engineering Objectives
- Primary objective
- Secondary objectives

### 1.5 Contributions
- Numbered, explicit contributions

### 1.6 Paper Organization
- Section-by-section roadmap

---

## 2. Related Work

### 2.1 Construction Change-Order Literature
- Causes, impacts, and trends

### 2.2 Evidence and Document Management in Construction
- Existing methods and limitations

### 2.3 AI/LLM/RAG for Operational Decision Support
- Relevant retrieval and generation approaches

### 2.4 Security, Governance, and Multi-Tenant System Literature
- Access control and architecture references

### 2.5 Research Gap
- What prior work does not address
- How SiteScribe differs

---

## 3. Problem Formulation

### 3.1 System Context
- Inputs, actors, outputs

### 3.2 Formal Definitions
- Evidence, signals, events, change orders, export package

### 3.3 Constraints
- Governance, security, traceability, operational constraints

### 3.4 Success Criteria
- What “improvement” means in measurable terms

---

## 4. Requirements Engineering

### 4.1 Functional Requirements (FR)
- FR table (ID, description, priority)

### 4.2 Non-Functional Requirements (NFR)
- Performance, reliability, security, maintainability, usability

### 4.3 Assumptions and Scope Boundaries
- In-scope / out-of-scope

### 4.4 Threat and Risk Considerations
- High-level risk assumptions before design

---

## 5. Methodology

### 5.1 Design Approach
- Evidence-centric workflow methodology

### 5.2 Data Flow Method
- How data moves from ingestion to export

### 5.3 Decision Logic
- Heuristic + optional AI enrichment strategy

### 5.4 Validation Approach
- Unit/integration/evaluation protocol strategy

---

## 6. System Architecture

### 6.1 Logical Architecture
- Layers: UI, server actions, domain services, persistence, integrations
- Mermaid diagram: system architecture

### 6.2 Trust Boundaries
- Security boundaries and control points

### 6.3 Component Responsibilities
- Clear role per major module

### 6.4 Deployment Topology
- Local, cloud, and production options
- Mermaid diagram: deployment topology

---

## 7. Data Model and Multi-Tenancy Design

### 7.1 Domain Model
- Organization, project, evidence, events, CO, export
- Mermaid ER diagram

### 7.2 Data Integrity Rules
- Key invariants and consistency rules

### 7.3 Access Model
- Role hierarchy and permission matrix

### 7.4 Audit and Provenance Strategy
- How traceability is preserved

---

## 8. Core Pipeline Design

### 8.1 Evidence Ingestion and Validation
- MIME, size, metadata checks

### 8.2 Extraction and Chunking
- Text extraction strategy
- Chunking strategy and rationale

### 8.3 Signal Detection and Event Formation
- Scoring and grouping logic
- Mermaid sequence/activity diagram

### 8.4 Change Order Draft Lifecycle
- Draft generation, editing, review, approval
- Mermaid state diagram

### 8.5 Export Integrity Pipeline
- PDF + ZIP + manifest generation
- Hash verification model
- Mermaid flow diagram

---

## 9. AI Augmentation Layer (Optional)

### 9.1 AI Scope and Operating Mode
- What works with AI on/off

### 9.2 AI Functions
- Summarization, retrieval, enrichment, chat, vision

### 9.3 Guardrails and Failure Handling
- Fallback behavior
- Hallucination and reliability constraints

### 9.4 Token/Usage Logging Strategy
- Monitoring and cost governance

---

## 10. Security and Privacy Engineering

### 10.1 Authentication and Session Security
- Session model and credential handling

### 10.2 Authorization and Tenant Isolation
- Server-side policy enforcement

### 10.3 Input Validation and Sanitization
- Validation strategy and constraints

### 10.4 Transport and Header Hardening
- CSP/HSTS and related controls

### 10.5 Threat Model
- STRIDE table or equivalent

### 10.6 Security Limitations and Future Hardening
- Known limitations and planned mitigations

---

## 11. Collaboration and Integration Features

### 11.1 Notifications
- Event-driven notification model

### 11.2 Webhooks
- Outbound integration model and security notes

### 11.3 Team Collaboration Modules
- Comments, friend model, chat

---

## 12. Implementation Details

### 12.1 Technology Stack
- Frameworks, libraries, runtime

### 12.2 Module-to-Feature Mapping
- Table mapping project modules to user-facing capabilities

### 12.3 Operational Configuration
- Environment variables and feature toggles

### 12.4 Internationalization and UX
- Locale model and accessibility/responsiveness notes

---

## 13. Evaluation Framework

### 13.1 Evaluation Questions
- What we test and why

### 13.2 Metrics
- Throughput, traceability, integrity, governance correctness

### 13.3 Experimental Setup
- Baseline vs. treatment workflow

### 13.4 Statistical Analysis Plan
- Effect size + confidence approach

### 13.5 Preliminary/Planned Results Presentation
- Result table/graph placeholders

---

## 14. Threats to Validity

### 14.1 Internal Validity
### 14.2 External Validity
### 14.3 Construct Validity
### 14.4 Conclusion Validity

---

## 15. Reproducibility and Open Science

### 15.1 Reproducibility Checklist
- Artifacts, setup, tests, versioning

### 15.2 Zenodo/DOI Strategy
- Version DOI vs. concept DOI
- Release workflow

### 15.3 FAIR Metadata Plan
- Metadata quality and discoverability

---

## 16. Discussion

### 16.1 Practical Impact
- Operational implications for construction teams

### 16.2 Engineering Lessons
- Architectural and product insights

### 16.3 Limitations
- Current system boundaries

### 16.4 Future Work
- Technical roadmap and research opportunities

---

## 17. Conclusion

### 17.1 Summary of Contributions
### 17.2 Key Takeaways
### 17.3 Final Remark on Adoption and Research Direction

---

## 18. References

### 18.1 Citation Style
- IEEE numeric citation format: [1], [2], ...

### 18.2 Hyperlinked Citation Requirement
- In-text citations should be clickable and linked to reference entries

### 18.3 Reference Quality Control
- Link reachable
- Title matches source
- Publication info consistent

---

## 19. Appendices

### Appendix A: Figure Plan (Screenshots)
- Figure title + exact screen to capture (in parentheses)

### Appendix B: Mermaid Diagrams Source
- Full mermaid blocks used in the paper

### Appendix C: Requirement Traceability Matrix
- Mapping from FR/NFR to modules and validation method

### Appendix D: Extended Tables
- Permission matrix
- Data lifecycle matrix
- Risk-control mapping

---

## Suggested Writing Workflow (Before Full Draft)

1. Freeze section-level claims and contribution statements.
2. Finalize figures/tables list before long writing.
3. Lock citation set and verify each source URL/title.
4. Draft sections 1-6 first (problem, method, architecture).
5. Draft evaluation/security/reproducibility sections.
6. Write abstract and conclusion last.
