# Epic 5: Market Data Integration (Public APIs)

## Story 5.1: Stock Price Fetching
- **As a** user
- **I want** my stock holdings to show real-time prices
- **So that** I see accurate portfolio values

**Acceptance Criteria:**
- [ ] Given app opens or refreshes, when stock data syncs, then fetch current prices from public API (e.g., Alpha Vantage, Yahoo Finance)
- [ ] Given price update, when completed, then recalculate portfolio values and display change indicators
- [ ] Edge case: API unavailable → Fallback to delayed data or last cached price
- [ ] Edge case: Delisted stock → Show "Trading suspended" warning with manual price override option

**Story Points**: 8

## Story 5.2: Crypto Price Fetching
- **As a** user
- **I want** my crypto holdings to update with live market prices
- **So that** I can track volatile crypto values in real-time

**Acceptance Criteria:**
- [ ] Given app in foreground, when background refresh triggers, then fetch crypto prices from CoinGecko/CoinMarketCap API
- [ ] Given price changes >5%, when updated, then show highlight animation on affected assets
- [ ] Edge case: API rate limit → Implement exponential backoff with queued updates
- [ ] Edge case: New token not in API → Allow manual price entry with custom update schedule

**Story Points**: 8
