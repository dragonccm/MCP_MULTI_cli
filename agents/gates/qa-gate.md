# QA Quality Gate — Testing Approval Checklist

Output APPROVED chỉ khi TẤT CẢ items bên dưới đạt:

## Test Coverage
- [ ] **Unit Test Coverage**: ≥ 85% statements
- [ ] **Branch Coverage**: ≥ 80%
- [ ] **Function Coverage**: ≥ 85%

## Test Results
- [ ] **Unit Tests**: 100% pass (0 failures)
- [ ] **Integration Tests**: 100% pass
- [ ] **E2E Tests**: 100% pass cho critical user flows

## Test Quality
- [ ] **Critical Paths Covered**: Login, main features, data operations
- [ ] **Edge Cases**: Empty inputs, invalid data, unauthorized access
- [ ] **Error Scenarios**: Network errors, timeout, server errors
- [ ] **Test Isolation**: No test dependencies on each other

## Performance
- [ ] **Lighthouse Performance**: ≥ 90
- [ ] **Lighthouse Accessibility**: ≥ 90
- [ ] **Lighthouse Best Practices**: ≥ 90
- [ ] **Lighthouse SEO**: ≥ 90

## Security
- [ ] **npm audit**: 0 high/critical vulnerabilities
- [ ] **Auth tested**: Protected routes verified
- [ ] **Input validation tested**: XSS, injection attempts

## Output Check
- [ ] Test summary table provided
- [ ] Coverage numbers documented
- [ ] Failed tests analyzed (if any)
- [ ] Tag: Contains "APPROVED" at the end
