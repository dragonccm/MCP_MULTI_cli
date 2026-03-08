# Epic 4: User Authentication & Profile

## Story 4.1: User Registration
- **As a** user
- **I want** to create an account with email and password
- **So that** I can securely access my financial data

**Acceptance Criteria:**
- [ ] Given I'm on the signup screen, when I enter valid email and password (min 8 chars), then my account is created
- [ ] Given I'm registering, when I submit the form, then I receive a verification email
- [ ] Edge case: Email already registered → Show error with "Forgot password" option
- [ ] Edge case: Weak password → Show password requirements before submission

**Story Points**: 5

## Story 4.2: User Login
- **As a** user
- **I want** to log in with my credentials
- **So that** I can access my financial data

**Acceptance Criteria:**
- [ ] Given I have an account, when I enter correct email and password, then I'm logged in and redirected to home
- [ ] Given I'm logged in, when I close and reopen the app, then I remain logged in (session persistence)
- [ ] Edge case: Wrong credentials → Show generic error (security best practice)
- [ ] Edge case: Account not verified → Prompt to verify email before login

**Story Points**: 3

## Story 4.3: Profile Management
- **As a** user
- **I want** to update my profile settings
- **So that** I can manage my account information

**Acceptance Criteria:**
- [ ] Given I'm logged in, when I navigate to profile, then I can view and edit my name, email, and preferences
- [ ] Given I want to change password, when I provide current and new password, then it's updated
- [ ] Edge case: Concurrent session from another device → Invalidate other sessions or allow multi-device
- [ ] Edge case: Delete account request → Show confirmation and data export option

**Story Points**: 5
