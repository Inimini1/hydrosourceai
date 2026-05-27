# /release — Gated Release Process

Every step requires explicit user approval before proceeding. No step is skipped.

## Release checklist

### Gate 1 — Quality (auto-run, report result)
- [ ] `/validate` passes (TypeScript + lint + build)
- **STOP** → "Gate 1 complete. Approve to continue to Gate 2?"

### Gate 2 — Pre-release review (user confirms each)
- [ ] All planned features for this release are implemented
- [ ] No known blocking bugs
- [ ] Environment variables documented in `.env.example`
- [ ] Supabase migrations applied (if schema changed)
- **STOP** → "Gate 2 complete. Approve to continue to Gate 3?"

### Gate 3 — Web deploy (Vercel)
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` set in Vercel
- [ ] `git push` to trigger Vercel deployment
- [ ] Confirm deployment URL is live and login works
- **STOP** → "Gate 3 complete. Approve to continue to Gate 4?"

### Gate 4 — Mobile build (Expo)
- [ ] Update `version` in `mobile/app.json` (bump patch/minor/major)
- [ ] Run `cd mobile && npx expo build` or EAS build command
- [ ] Test on device/simulator
- **STOP** → "Gate 4 complete. Approve to submit to App Store?"

### Gate 5 — App Store submission
- [ ] Run `/app-store-preflight-skills` audit
- [ ] Fix any flagged issues
- [ ] Submit via EAS Submit or Transporter
- **STOP** → "Gate 5 complete. Release done."

## Rules
- Never skip gates or combine approvals
- If any gate fails, fix and restart that gate only
- Document the release version and date in CLAUDE.md after Gate 5
