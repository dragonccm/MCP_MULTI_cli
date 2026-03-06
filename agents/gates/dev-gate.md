# Dev Quality Gate — Code Approval Checklist

Áp dụng cho cả Frontend và Backend. Output APPROVED chỉ khi TẤT CẢ items đạt:

## Build & Compile
- [ ] **Build Success**: `npm run build` pass không errors
- [ ] **TypeScript Clean**: `tsc --noEmit` pass
- [ ] **Lint Clean**: `eslint` pass

## Code Quality
- [ ] **No `any` types**: TypeScript strict compliance
- [ ] **Naming conventions**: camelCase functions, PascalCase components/classes
- [ ] **No hardcoded values**: Constants/env vars thay magic strings
- [ ] **Error handling**: Try/catch cho async operations
- [ ] **No console.log**: Only proper logging

## Architecture
- [ ] **Separation of concerns**: Layers rõ ràng
- [ ] **No circular dependencies**
- [ ] **Follows project structure**: Đúng theo blueprint từ prompt

## Features
- [ ] **PRD Coverage**: Tất cả features P0 đã implement
- [ ] **Working code**: Không có stub/placeholder functions

## Output Check
- [ ] Implementation report có files created list
- [ ] Build status documented
- [ ] Tag: Contains "APPROVED" at the end
