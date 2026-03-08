# Epic 3: AI Financial Advisor (Gemini)

## Story 3.1: Get Spending Analysis
- **As a** user
- **I want** to receive AI-powered analysis of my spending patterns
- **So that** I can understand my financial habits

**Acceptance Criteria:**
- [ ] Given I have transaction history, when I request spending analysis, then AI provides insights on categories, trends, and anomalies
- [ ] Given I have budget concerns, when I ask for advice, then AI provides actionable recommendations
- [ ] Edge case: Insufficient data (<5 transactions) → AI explains more data is needed for meaningful analysis
- [ ] Edge case: API timeout → Show retry option with cached general tips

**Story Points**: 8

## Story 3.2: Get Investment Advice
- **As a** user
- **I want** to receive AI-powered investment insights
- **So that** I can make informed investment decisions

**Acceptance Criteria:**
- [ ] Given I have a portfolio, when I request investment analysis, then AI provides portfolio diversification insights and risk assessment
- [ ] Given market news is available, when I ask about market conditions, then AI summarizes relevant news with investment implications
- [ ] Edge case: High-risk portfolio detected → AI includes risk warning and suggests diversification
- [ ] Edge case: Gemini API unavailable → Show cached general investment principles

**Story Points**: 8

## Story 3.3: Budget Planning Assistant
- **As a** user
- **I want** to get budget recommendations from AI
- **So that** I can plan my finances better

**Acceptance Criteria:**
- [ ] Given I have income and expense history, when I request budget planning, then AI suggests category-wise budget limits
- [ ] Given my spending patterns, when I exceed a category, then AI provides alerts and adjustment suggestions
- [ ] Edge case: Irregular income pattern → AI acknowledges uncertainty and provides range-based recommendations
- [ ] Edge case: User rejects AI suggestions → AI learns and adjusts future recommendations

**Story Points**: 8
