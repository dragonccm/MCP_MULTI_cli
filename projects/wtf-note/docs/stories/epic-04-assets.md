# Epic 4: Asset Management (Stocks, Crypto, Real Estate)

## Story 4.1: Add Stock Asset
- **As a** user
- **I want** to add stocks to my portfolio
- **So that** I can track my investment performance

**Acceptance Criteria:**
- [ ] Given user adds stock, when form submitted, then record includes ticker symbol, quantity, purchase price, purchase date
- [ ] Given stock added, when viewed in portfolio, then show current value (live price × quantity) and gain/loss
- [ ] Edge case: Invalid ticker → Show error "Stock symbol not found" with search suggestions
- [ ] Edge case: Market closed → Show last close price with "Delayed data" indicator

**Story Points**: 8

## Story 4.2: Add Crypto Asset
- **As a** user
- **I want** to add cryptocurrency holdings
- **So that** I can monitor my crypto investments

**Acceptance Criteria:**
- [ ] Given user adds crypto, when form submitted, then record includes coin symbol, quantity, average buy price, wallet/exchange name
- [ ] Given crypto added, when viewed, then show current value (live API price) and 24h change percentage
- [ ] Edge case: Unsupported coin → Allow manual price entry with user-defined symbol
- [ ] Edge case: API rate limit → Cache last known price with timestamp indicator

**Story Points**: 8

## Story 4.3: Add Real Estate Asset
- **As a** user
- **I want** to record real estate properties
- **So that** I can include property values in my net worth

**Acceptance Criteria:**
- [ ] Given user adds property, when form submitted, then record includes property name, address, purchase price, estimated current value, property type
- [ ] Given property added, when viewed, then show in asset list with manual value update option
- [ ] Edge case: Multiple owners → Support ownership percentage field
- [ ] Edge case: Mortgage linked → Show option to link to debt record for net equity calculation

**Story Points**: 5

## Story 4.4: Asset Portfolio Overview
- **As a** user
- **I want** to see total asset portfolio value
- **So that** I know my overall investment performance

**Acceptance Criteria:**
- [ ] Given user opens portfolio, when loaded, then display total value, total invested, total gain/loss, allocation pie chart
- [ ] Given assets exist, when viewed, then show breakdown by asset class (Stocks/Crypto/Real Estate)
- [ ] Edge case: No assets → Show empty state with educational content about investing
- [ ] Edge case: Price fetch failure → Show cached prices with "Last updated" timestamp

**Story Points**: 8
