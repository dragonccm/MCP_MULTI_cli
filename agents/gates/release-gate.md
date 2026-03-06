# Release Quality Gate — Deploy Approval Checklist

Output APPROVED chỉ khi TẤT CẢ items bên dưới đạt:

## Pre-Deploy
- [ ] **QA Report**: PASSED
- [ ] **QC Report**: PASSED (score ≥ 80)
- [ ] **Build Success**: Production build pass
- [ ] **Dependencies**: No high/critical vulnerabilities
- [ ] **Environment Variables**: All required env vars configured
- [ ] **No Uncommitted Changes**: Clean working directory

## Deploy
- [ ] **Deploy Completed**: No errors during deployment
- [ ] **Production URL**: Accessible and responding

## Post-Deploy Verification
- [ ] **Homepage Loads**: < 3s load time
- [ ] **Login Flow**: Working end-to-end
- [ ] **Core Features**: At least 1 critical flow verified
- [ ] **API Health Check**: Returns 200 OK
- [ ] **No Console Errors**: Browser console clean

## Release Artifacts
- [ ] **Version Bumped**: package.json updated
- [ ] **CHANGELOG.md**: Updated with release notes
- [ ] **Git Tag**: Created with version number
- [ ] **Git Push**: Tag pushed to remote

## Safety
- [ ] **Rollback Plan**: Documented and tested
- [ ] **Monitoring**: Basic health monitoring active

## Output Check
- [ ] Release info documented (version, date, commit, URL)
- [ ] All checks marked with results
- [ ] Tag: Contains "APPROVED" at the end
