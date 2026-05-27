# /plan — Research & Propose (Plan Mode Only)

You are in **PLAN MODE**. You may read files, search the codebase, and reason. You may NOT write or edit any code.

## When invoked with `/plan <task>`

1. **Understand the task** — read relevant files, check types, review existing patterns
2. **Research** — find all files that will need to change, identify risks, note dependencies
3. **Propose** — output a numbered implementation plan:
   - Each step: what file, what change, why
   - Estimated complexity (S/M/L)
   - Any blockers or open questions that need user input
4. **Stop** — wait for user approval before any implementation

## Rules
- NO code edits, NO file writes, NO shell commands that modify state
- Flag every uncertainty as a question for the user
- End with: "**Ready to implement? Reply `/implement` to proceed.**"

## Output format
```
## Plan: <task name>

### Files affected
- `path/to/file` — reason

### Steps
1. ...
2. ...

### Risks / open questions
- ...

**Ready to implement? Reply `/implement` to proceed.**
```
