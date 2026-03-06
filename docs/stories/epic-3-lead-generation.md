# Epic 3: Lead Generation & Automation
**Priority**: P0

## Overview
This epic covers the critical lead capture functionality and automated processing via n8n.

## User Stories

### Story 3.1: Smart Contact Form with n8n Integration
- **As a** lead
- **I want** to submit my contact details and business pain points
- **So that** I can receive an automated audit or consultation booking.

**Acceptance Criteria:**
- [ ] Given the contact form, when I submit, then data is sent to an n8n webhook for processing.
- [ ] Given a successful submission, when the webhook returns 200, then the UI shows a "Success" animation and I receive a confirmation email.
- [ ] Edge case: Webhook timeout -> Show a "Submission Delayed" message and retry in the background while notifying the user.
- [ ] Edge case: Spambots -> Integrate a hidden honeypot field or invisible CAPTCHA.

**Story Points**: 5

### Story 3.2: Floating CTA for Instant Contact
- **As a** user needing quick help
- **I want** a floating button to contact via Zalo/Messenger
- **So that** I don't have to scroll to the bottom to reach out.

**Acceptance Criteria:**
- [ ] Given the user is on any part of the page, when they look at the bottom right, then they see a pulsing "Consult Now" button.
- [ ] Given I click the button, when it opens, then I see clear icons for Zalo and Messenger.
- [ ] Edge case: Mobile device -> The button should be larger but not block critical content.
- [ ] Edge case: User closes the contact options or clicks outside -> The button should return to its original pulsing state and close the menu.

**Story Points**: 2

APPROVED ✅
