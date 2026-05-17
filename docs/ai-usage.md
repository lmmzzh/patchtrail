# AI usage prompts

Use this page when you want Codex, Claude Code, Cursor, or another AI coding tool to run `zmg` as part of its normal code-change workflow.

## Copy this prompt

```text
Before changing code, run zmg task start --goal "<short task goal>" in the project root.

After changing code, run zmg check.

After zmg check, run zmg handoff.

After zmg handoff, run zmg task close.

If zmg check reports risks, explain:
1. Which risks belong to the current task.
2. Which risks may be accidental changes.
3. Which files need manual verification.
4. Where the full report is located.
5. Where the handoff is located.
6. What should be compiled, tested, or manually verified.

Do not treat a passing zmg check as proof that the project builds or the business behavior is correct.
After zmg check and zmg handoff, still explain what should be compiled, tested, or manually verified.
```

## Recommended local flow

```bash
zmg start
# let the AI change code
zmg check
zmg handoff
```

Task flow:

```bash
zmg task start --goal "Describe the change"
# let the AI change code
zmg check
zmg handoff
zmg task close
```

Use strict mode only when you want the command to fail on medium or high risk:

```bash
zmg check --strict
```

`zmg check` checks change risk. `zmg handoff` turns the latest check result into a short Markdown handoff for the next agent or future you. `zmg task start` adds the task goal to the check report and handoff. These commands do not replace builds, tests, or real-device verification.
