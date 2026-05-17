# PatchTrail

PatchTrail 的意思是“代码变更轨迹”。它是一个面向 iOS / Flutter 项目的 AI 编程辅助工具，帮助每一轮 AI 改代码留下可读的工作痕迹。

当前 npm 包名仍然是 `zzh-mobile-ai-guard`，CLI 命令仍然是 `zmg`。

先安装一次，再用短命令接入。AI 改代码前先开始一个任务，改完后运行 `check` 和 `handoff`。PatchTrail 会告诉你这轮改动能不能继续、哪里有风险、需要人工验证什么，也让下一轮 agent 或未来的自己更容易接手。

```bash
npm install -g zzh-mobile-ai-guard
zmg init
zmg task start --goal "描述这次改动"
zmg check
zmg handoff
zmg task close
```

## 它解决什么问题

AI 改移动端项目时，最容易出问题的通常不是“代码写不出来”，而是：

- 改动范围超过本轮目标
- 顺手动了支付、订阅、登录、扫脸等核心功能流程
- 修改了 `Podfile`、`Info.plist`、`pubspec.yaml` 等高风险文件
- 留下测试数据、跳过校验、调试开关、强制解锁这类临时代码
- 改完以后没有清楚的人工验证建议

PatchTrail 不替代编译、测试和真机验证。它只帮你检查 AI 这轮实际改动有没有明显风险，并把任务目标、改动范围、风险项和交接信息整理成可读的变更轨迹。

## 常用命令

```bash
zmg init
zmg start
zmg check
zmg handoff
```

任务流程：

```bash
zmg task start --goal "描述这次改动"
# 让 AI 开始改代码
zmg check
zmg handoff
zmg task close
```

高级命令：

```bash
zmg status
zmg report
zmg check --strict
```

如果你想在本地 Git Hook 里拦住中高风险改动，可以使用 `zmg check --strict`。

## 在 Codex CLI 里怎么用

你有两种简单用法。

方式一：让 Codex 帮你运行终端命令：

```text
改代码前，先在当前项目根目录运行 zmg start。
改完后，运行 zmg check，再运行 zmg handoff，并把风险项、验证项和交接文档路径告诉我。
```

方式二：另开一个终端自己运行：

```bash
cd /path/to/your/project
zmg start
# 让 AI 开始改代码
zmg check
zmg handoff
```

如果你希望下一轮 agent 能看到本轮任务目标，可以从 task 开始：

```bash
zmg task start --goal "描述这次改动"
# 让 AI 开始改代码
zmg check
zmg handoff
zmg task close
```

`zmg start`、`zmg check` 和 `zmg handoff` 是终端命令，不是 Codex / Claude Code / Cursor 里的 `/start` 或 `/check`。

如果你想让 Codex / Claude Code / Cursor 自动配合使用，可以复制 [docs/ai-usage.zh-CN.md](docs/ai-usage.zh-CN.md) 里的提示词。

如果你想接入本地 Git Hook，可以看 [docs/integrations.zh-CN.md](docs/integrations.zh-CN.md)。

## 接入后会生成什么

```text
.zzh-mobile-ai-guard/
  rules.yml
  baselines/
  reports/
  handoffs/
  tasks/
```

第一次使用不需要先改 `rules.yml`。

## 示例输出

```text
检查完成：未发现明显风险，可以继续按正常流程验证。

改动文件：0 个
新增/删除：+0 / -0

未发现明显结构风险。
注意：这不代表业务功能已经验证通过。

完整报告：.zzh-mobile-ai-guard/reports/2026-04-29T04-51-09-253Z-check.md
```

报告会先给结论，再列出改动范围、风险项、建议人工验证项和下一步建议。

如果你希望下一轮 agent 或未来的自己更容易接手，可以在 `zmg check` 后运行 `zmg handoff`。它会基于最近一次检查结果生成一份 Markdown 交接文档，列出改动范围、风险项、人工验证项、下一轮应该先读哪里，以及仍需确认的问题。它同样不代表项目已经编译通过，也不代表业务功能正确。

如果你希望检查报告和交接文档里带上本轮任务目标，可以使用 `zmg task start --goal "..."`。`zmg task close` 会把任务交接文档保存到 `.zzh-mobile-ai-guard/tasks/`，并清理当前 active task。

## License

MIT
