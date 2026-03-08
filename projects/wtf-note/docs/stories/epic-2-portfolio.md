# Epic 2: Asset & Portfolio Tracking

## Story 2.1: Add Investment Asset
- **As a** user
- **I want** to add investment assets (stocks, crypto, funds) to my portfolio
- **So that** I can track my investment holdings

**Acceptance Criteria:**
- [ ] Given I'm on the portfolio screen, when I tap "Add Asset" and enter details (symbol, quantity, purchase price, purchase date), then the asset is added
- [ ] Given I'm adding an asset, when I enter a stock/crypto symbol, then auto-suggest is provided if available
- [ ] Edge case: Duplicate symbol entry → Warn user and offer to update existing holding
- [ ] Edge case: Invalid symbol format → Show validation error with format hint

**Story Points**: 5

## Story 2.2: View Portfolio Value
- **As a** user
- **I want** to see my total portfolio value with current market prices
- **So that** I know my investment performance

**Acceptance Criteria:**
- [ ] Given I'm on the portfolio screen, when I view my assets, then I see current value, purchase value, and gain/loss for each
- [ ] Given market data is available, when the app refreshes, then portfolio values are updated with latest prices
- [ ] Edge case: Market API unavailable → Show last cached prices with timestamp warning
- [ ] Edge case: Asset has no market data (delisted/private) → Show "No data" with manual value entry option

**Story Points**: 8

## Story 2.3: View Financial News
- **As a** user
- **I want** to see relevant financial news
- **So that** I stay informed about market conditions

**Acceptance Criteria:**
- [ ] Given I'm on the news screen, when I open the app, then I see a feed of financial news articles
- [ ] Given I have specific assets in my portfolio, when I view news, then relevant articles are prioritized
- [ ] Edge case: No news available → Show message and retry option
- [ ] Edge case: API rate limit exceeded → Show cached news with refresh timer

**Story Points**: 5
