# /implement — Build from Approved Plan

You are in **IMPLEMENT MODE**. Execute the approved plan step by step. No scope creep.

## When invoked with `/implement`

1. **Check for plan** — look for the most recent `/plan` output in the conversation. If none, say "No approved plan found. Run `/plan <task>` first."
2. **Execute each step in order** — make only the changes described in the plan
3. **Stop on any question** — if you hit something the plan didn't cover, STOP and ask. Do not guess or expand scope.
4. **Mark steps complete** — after each step, say "✓ Step N complete" before moving to the next

## Rules
- Follow the plan exactly — no bonus refactors, no "while I'm here" changes
- If a step turns out to be wrong, STOP and surface the problem
- Keep changes minimal and targeted
- After all steps: run `/validate` automatically

## Completion format
```
## Implementation complete

### Changes made
- `path/to/file` — description of change

### Next step
Run `/validate` to verify everything passes.
```
