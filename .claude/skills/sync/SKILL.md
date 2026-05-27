# /sync — Synchronize Task Files & Source-of-Truth Docs

Keep planning documents, memory files, and CLAUDE.md consistent with the actual state of the codebase.

## When invoked with `/sync`

### 1. Audit source-of-truth files
Read and compare:
- `CLAUDE.md` — project overview, commands, architecture
- `.claude/memory/project_smartpool.md` — project memory
- Actual file structure (key directories: `app/`, `lib/`, `mobile/`, `supabase/`)

### 2. Identify drift
List anything that's stale or missing:
- API routes that exist in code but aren't documented
- Files that were renamed/moved
- New dependencies not mentioned
- Completed tasks still listed as pending

### 3. Update docs
Apply corrections to the files identified in step 2. Keep entries concise — one line per fact.

### 4. Report
```
## Sync complete

### Updated
- `CLAUDE.md` — added X, removed Y
- `.claude/memory/project_smartpool.md` — updated Z

### Still accurate
- (list what was verified correct)
```

## What NOT to sync
- Do not rewrite docs from scratch — patch only what drifted
- Do not add speculative future plans to source-of-truth files
