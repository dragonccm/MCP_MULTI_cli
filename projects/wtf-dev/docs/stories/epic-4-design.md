# Epic 4: Design & UX (Refined Light Brutalism)

## Story 4.1: Implement Design System
**Priority**: P0 | **Story Points**: 8

### User Story
- **As a** user
- **I want** a consistent, modern UI with Refined Light Brutalism style
- **So that** I enjoy using the app daily

### Acceptance Criteria
- [ ] Given any screen, when I view it, then I see bold borders, soft pastel colors, and clear typography
- [ ] Given I interact with buttons, when I tap, then I see strong shadow effects and clear feedback
- [ ] Edge case: Dark mode preference → Provide light-only design (per brutalism style) with high contrast
- [ ] Edge case: Accessibility needs → Ensure WCAG AA compliance while maintaining design integrity

### Technical Notes
- Refined Light Brutalism characteristics:
  - Bold, thick borders (2-4px)
  - Soft pastel color palette (lavender, mint, peach, sky blue)
  - Strong drop shadows for depth
  - Clean, sans-serif typography
  - Geometric shapes and clear visual hierarchy
- Color tokens, spacing tokens, typography tokens in theme file

---

## Story 4.2: Smooth Navigation & Animations
**Priority**: P0 | **Story Points**: 5

### User Story
- **As a** user
- **I want** fluid transitions between screens
- **So that** the app feels responsive and polished

### Acceptance Criteria
- [ ] Given I navigate between tabs, when I switch, then I see smooth slide animations (<300ms)
- [ ] Given I perform an action (add transaction), when completed, then I see a satisfying success animation
- [ ] Edge case: Low-end device → Reduce animation complexity but maintain smoothness
- [ ] Edge case: Reduced motion preference (OS setting) → Respect and disable animations

### Technical Notes
- React Navigation for screen transitions
- Reanimated or LayoutAnimation for micro-interactions
- Respect `prefers-reduced-motion` media query
