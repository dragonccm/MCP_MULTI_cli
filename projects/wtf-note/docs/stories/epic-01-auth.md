# Epic 1: Authentication & User Management

## Story 1.1: User Registration
- **As a** new user
- **I want** to create an account with email and password
- **So that** I can securely access my financial data across devices

**Acceptance Criteria:**
- [ ] Given valid email and password (min 8 chars), when user submits registration form, then account is created and user is logged in
- [ ] Given email already exists, when user submits registration, then show error "Email already registered"
- [ ] Edge case: Weak password (< 8 chars) → Show password strength requirements
- [ ] Edge case: Network failure during registration → Show retry option with form data preserved

**Story Points**: 5

## Story 1.2: User Login
- **As a** registered user
- **I want** to log in with my credentials
- **So that** I can access my personal financial dashboard

**Acceptance Criteria:**
- [ ] Given valid email and password, when user submits login form, then redirect to home dashboard with auth token
- [ ] Given invalid credentials, when user submits login, then show error "Invalid email or password"
- [ ] Edge case: Account locked after 5 failed attempts → Show unlock timer
- [ ] Edge case: Session expired → Auto-redirect to login with "Session expired" message

**Story Points**: 3

## Story 1.3: Profile Management
- **As a** logged-in user
- **I want** to view and edit my profile information
- **So that** I can update my personal details and preferences

**Acceptance Criteria:**
- [ ] Given user navigates to profile, when page loads, then display name, email, currency preference, notification settings
- [ ] Given user updates profile fields, when saved, then changes persist and show success toast
- [ ] Edge case: Email change → Require re-verification
- [ ] Edge case: Concurrent session conflict → Show "Changes saved on another device" warning

**Story Points**: 5
