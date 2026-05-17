# PatchTrail

PatchTrail leaves a readable trail for AI coding sessions in iOS and Flutter projects.

The npm package is `patchtrail`, and the CLI command is `zmg`.

Install once, start a task before AI changes code, then run `check` and `handoff` after. PatchTrail helps future agents understand what changed, why the task started, where the risk is, and what still needs manual verification.

```bash
npm install -g patchtrail
zmg init
zmg task start --goal "Describe the change"
zmg check
zmg handoff
zmg task close
```

## Why

AI coding agents can move fast, but mobile projects have risky files and flows:

- iOS signing, permissions, Podfile, `Info.plist`, bridging headers
- Flutter `pubspec.yaml`, iOS/Android platform folders
- payment, subscription, login, FaceScan, history, result pages
- temporary mock, bypass, debug, or force-unlock code

PatchTrail does not prove business behavior is correct. It checks whether an AI coding session changed risky areas and generates a human-readable trail for the next agent or future you.

## Commands

```bash
zmg init
zmg start
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

Advanced:

```bash
zmg status
zmg report
zmg check --strict
```

Use `zmg check --strict` when you want a local Git Hook to stop a commit if medium or high risk is found.

## Use with Codex CLI or other AI CLIs

There are two simple ways to use `zmg` while working with an AI coding agent.

Option 1: ask the AI agent to run it:

```text
Before changing code, run zmg start in the project root.
After changing code, run zmg check, then run zmg handoff and summarize the risks, verification items, and handoff path.
```

Option 2: run it yourself in another terminal:

```bash
cd /path/to/your/project
zmg start
# let the AI change code
zmg check
zmg handoff
```

If you want the next agent to understand the task goal, start with a task:

```bash
zmg task start --goal "Describe the change"
# let the AI change code
zmg check
zmg handoff
zmg task close
```

`zmg start`, `zmg check`, and `zmg handoff` are terminal commands. They are not slash commands like `/start` or `/check`.

For copyable prompts for Codex, Claude Code, Cursor, or other AI coding tools, see [docs/ai-usage.md](docs/ai-usage.md).

For local Git Hook setup, see [docs/integrations.md](docs/integrations.md).

## What it creates

```text
.zzh-mobile-ai-guard/
  rules.yml
  baselines/
  reports/
  handoffs/
  tasks/
```

You can finish the first run without editing `rules.yml`.

## Example output

```text
检查完成：未发现明显风险，可以继续按正常流程验证。

改动文件：0 个
新增/删除：+0 / -0

未发现明显结构风险。
注意：这不代表业务功能已经验证通过。

完整报告：.zzh-mobile-ai-guard/reports/2026-04-29T04-51-09-253Z-check.md
```

The report always starts with a conclusion, then lists changed files, risks, manual verification items, and suggested next steps.

Run `zmg handoff` after `zmg check` when you want a short Markdown handoff for the next agent or future you. The handoff points back to the latest check report, lists the changed scope, risks, manual verification items, and open questions. It still does not prove the project builds or the business behavior is correct.

Run `zmg task start --goal "..."` when you want the check report and handoff to include the task goal. `zmg task close` saves the task handoff under `.zzh-mobile-ai-guard/tasks/` and clears the current active task.

## License

MIT
