# Epic 6: Dashboard & Analytics

## Story 6.1: Home Dashboard
- **As a** user
- **I want** to see financial overview at a glance
- **So that** I understand my current financial status

**Acceptance Criteria:**
- [ ] Given user opens app, when dashboard loads, then show total balance, monthly income, monthly expense, net worth
- [ ] Given transactions exist, when displayed, then show recent transactions list (last 5) and spending trend mini-chart
- [ ] Edge case: First-time user → Show onboarding tooltips and sample data toggle
- [ ] Edge case: Data loading → Show skeleton loaders with progressive rendering

**Story Points**: 8

## Story 6.2: Spending Analytics
- **As a** user
- **I want** to visualize my spending by category and time
- **So that** I can identify areas to reduce expenses

**Acceptance Criteria:**
- [ ] Given user opens analytics, when loaded, then display bar chart (daily/weekly/monthly), pie chart by category, trend line
- [ ] Given user selects time range, when changed, then all charts update to reflect selected period
- [ ] Edge case: Insufficient data → Show "Need more transactions" with minimum 7 days recommendation
- [ ] Edge case: Outlier detection → Highlight unusual spending spikes with annotation

**Story Points**: 8

## Story 6.3: Budget Tracking
- **As a** user
- **I want** to set monthly budgets for categories
- **So that** I can control my spending

**Acceptance Criteria:**
- [ ] Given user sets budget, when saved, then track spending vs budget per category with progress bars
- [ ] Given spending exceeds 80% of budget, when threshold reached, then show warning notification
- [ ] Edge case: Budget exceeded → Show red indicator with overspend amount
- [ ] Edge case: Mid-month budget change → Prorate budget based on remaining days

**Story Points**: 5
