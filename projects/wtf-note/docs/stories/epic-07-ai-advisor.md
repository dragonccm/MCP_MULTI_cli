# Epic 7: AI Financial Advisor

## Story 7.1: AI Spending Insights
- **As a** user
- **I want** AI to analyze my spending patterns
- **So that** I receive personalized saving recommendations

**Acceptance Criteria:**
- [ ] Given user has 30+ days of transaction data, when AI analysis runs, then generate insights (top spending categories, unusual patterns, saving opportunities)
- [ ] Given insights generated, when displayed, then show actionable tips with estimated monthly savings
- [ ] Edge case: Insufficient data → Show "Need more transaction history" with progress indicator
- [ ] Edge case: AI service unavailable → Gracefully degrade to rule-based insights

**Story Points**: 13

## Story 7.2: AI Budget Recommendations
- **As a** user
- **I want** AI to suggest optimal budget limits
- **So that** I can set realistic spending goals

**Acceptance Criteria:**
- [ ] Given 3+ months of history, when AI calculates, then recommend category budgets based on historical averages and income
- [ ] Given recommendations shown, when user accepts, then auto-create budgets with one tap
- [ ] Edge case: Irregular income → Show variable budget ranges (conservative/moderate/aggressive)
- [ ] Edge case: User rejects recommendation → Learn from feedback and adjust future suggestions

**Story Points**: 13

## Story 7.3: AI Net Worth Projection
- **As a** user
- **I want** AI to project my net worth growth
- **So that** I can plan for financial goals

**Acceptance Criteria:**
- [ ] Given user inputs savings rate and goals, when AI projects, then show 1/5/10 year net worth forecast with charts
- [ ] Given projection displayed, when viewed, then show assumptions (inflation rate, investment return) with edit option
- [ ] Edge case: Missing asset data → Show "Add more assets for accurate projection" prompt
- [ ] Edge case: Market volatility → Show confidence intervals (optimistic/base/conservative scenarios)

**Story Points**: 13
