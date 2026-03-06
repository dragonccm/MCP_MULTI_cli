# Epic 3: AI Insights & Recommendations

## Story 3.1: AI Spending Analysis
**Priority**: P1 | **Story Points**: 13

### User Story
- **As a** user
- **I want** to receive AI-powered insights about my spending habits
- **So that** I can identify areas to improve

### Acceptance Criteria
- [ ] Given I have 7+ days of transaction data, when I view Insights screen, then I see weekly spending trends and anomalies
- [ ] Given my spending exceeds a category budget, when AI detects it, then I receive a notification with suggestions
- [ ] Edge case: Insufficient data → Show message "Need more data for insights" with progress indicator
- [ ] Edge case: AI service unavailable → Show cached insights with timestamp

### Technical Notes
- AI analyzes: spending velocity, category distribution, unusual patterns
- Integration with OpenClaw or similar AI service

---

## Story 3.2: AI Budget Suggestions
**Priority**: P1 | **Story Points**: 13

### User Story
- **As a** user
- **I want** AI to suggest monthly budgets based on my history
- **So that** I can set realistic spending limits

### Acceptance Criteria
- [ ] Given I have 30+ days of history, when I navigate to Budget screen, then AI suggests category budgets
- [ ] Given I accept a suggestion, when the budget is set, then I can track progress against it
- [ ] Edge case: Irregular income → AI adjusts suggestions based on income variability
- [ ] Edge case: User rejects all suggestions → Ask for feedback to improve future recommendations

### Technical Notes
- Budget calculation: Average spending + safety margin
- Feedback loop: Store accepted/rejected suggestions for model improvement

---

## Story 3.3: Investment Insights (Crypto/Stock)
**Priority**: P1 | **Story Points**: 13

### User Story
- **As a** user
- **I want** to see AI analysis of my investment performance
- **So that** I can make informed decisions

### Acceptance Criteria
- [ ] Given I hold crypto/stocks, when I view Portfolio screen, then I see P&L, gain/loss percentage, and AI commentary
- [ ] Given significant price movement (>10%), when I open the app, then I see an alert with AI summary
- [ ] Edge case: Price API failure → Show last known price with warning
- [ ] Edge case: New investment (no history) → Show "Too early for analysis" message

### Technical Notes
- Price sources: CoinGecko (crypto), Alpha Vantage/Yahoo Finance (stocks)
- P&L calculation: (current_price - avg_buy_price) * quantity
