# /validate — Full Quality Gate

Run the complete quality gate for SmartPool AI. All checks must pass before marking work done.

## Quality gate sequence (run in order)

### 1. TypeScript
```bash
npx tsc --noEmit
```
Must have 0 errors.

### 2. Lint
```bash
npx eslint . --ext .ts,.tsx --max-warnings 0
```

### 3. Build
```bash
npm run build
```
Must complete with no errors.

### 4. Mobile TypeScript (if mobile/ was changed)
```bash
cd mobile && npx tsc --noEmit
```

## After running all checks

Report results as a table:

| Check | Status | Notes |
|---|---|---|
| TypeScript | ✅ / ❌ | error count |
| Lint | ✅ / ❌ | warning count |
| Build | ✅ / ❌ | — |
| Mobile TS | ✅ / ❌ | if applicable |

If any check fails: fix the issues and re-run that check before marking validate complete.

## Pass condition
All checks green → "**Quality gate passed. Ready to `/release`.**"
