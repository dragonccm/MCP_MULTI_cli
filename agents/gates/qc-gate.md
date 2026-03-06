# QC Quality Gate — Code Review Approval Checklist

Output APPROVED chỉ khi TẤT CẢ items bên dưới đạt:

## Critical (Must Pass)
- [ ] **0 Critical Issues**: Security vulnerabilities, data leaks, crashes
- [ ] **TypeScript Clean**: No compilation errors
- [ ] **Lint Clean**: No linting errors
- [ ] **No Secrets Exposed**: No hardcoded API keys, passwords, tokens
- [ ] **Auth Verified**: All protected routes have auth checks

## Code Quality Score ≥ 80/100
- [ ] **Structure** (15pts): Clean project organization
- [ ] **Architecture** (20pts): Proper separation, no anti-patterns
- [ ] **Code Quality** (20pts): Readable, maintainable, DRY
- [ ] **Security** (25pts): Input validation, encryption, auth
- [ ] **Performance** (10pts): No N+1, proper caching
- [ ] **Accessibility** (10pts): Semantic HTML, ARIA, keyboard nav

## Review Completeness
- [ ] All source files reviewed
- [ ] Security scan completed
- [ ] Performance review completed
- [ ] Architecture assessment done
- [ ] Recommendations documented

## Output Check
- [ ] Score breakdown provided
- [ ] All issues categorized (Critical/Warning/Suggestion)
- [ ] Fixes applied for critical issues
- [ ] Tag: Contains "APPROVED" at the end
