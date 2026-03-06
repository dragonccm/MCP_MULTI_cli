# Epic 2: Service Presentation & Bento Grid
**Priority**: P0

## Overview
This epic covers the detailed presentation of WTF DEV's core services using a modern Bento Box layout and interactive visualizations.

## User Stories

### Story 2.1: Bento Box Service Grid
- **As a** potential client
- **I want** to browse through services (Marketing, SEO, Ads Auto, etc.) in a Bento Box grid layout
- **So that** I can quickly scan and find the solutions I need.

**Acceptance Criteria:**
- [ ] Given the services section, when I view the grid, then I see cards of varying sizes (1x1, 2x1, 2x2) reflecting service importance.
- [ ] Given a service card, when I hover, then it scales up slightly and shows a "Learn More" arrow or highlight.
- [ ] Edge case: Screen size < 768px -> Bento grid should collapse into a single-column or simplified 2-column layout.
- [ ] Edge case: Content too long for small bento card -> Text should be truncated with ellipsis and a tooltip for full view.

**Story Points**: 5

### Story 2.2: Interactive n8n Workflow Showcase
- **As a** CTO/Operations Manager
- **I want** to see an interactive visualization of an n8n workflow (e.g., Lead -> CRM -> Slack)
- **So that** I can understand how my business processes will be automated.

**Acceptance Criteria:**
- [ ] Given the n8n section, when I view the workflow diagram, then it should show glowing lines connecting "nodes" to represent data flow.
- [ ] Given I hover over nodes (e.g., "AI Analysis Node"), then a tooltip appears explaining the logic of that step.
- [ ] Edge case: Low-power device -> Disable glowing line animations but keep static connections.
- [ ] Edge case: SVG load failure -> Show a fallback text-based "Process Map".

**Story Points**: 8

APPROVED ✅
