# AI 使用说明

当你想让 Codex、Claude Code、Cursor 或其他 AI 编程工具配合使用 `zmg` 时，可以直接复制下面这段提示词。

## 可复制提示词

```text
本轮改代码前，请先在项目根目录运行 zmg start。

改完代码后，请运行 zmg check。

zmg check 之后，请运行 zmg handoff。

如果 zmg check 报告风险，请先说明：
1. 哪些风险属于本轮目标。
2. 哪些风险可能是误改。
3. 哪些文件需要我人工验证。
4. 完整报告路径在哪里。
5. 交接文档路径在哪里。

不要把 zmg check 通过当成编译通过或业务功能验证通过。
zmg check 和 zmg handoff 之后，仍然要说明需要编译、测试或真机验证哪些内容。
```

## 推荐本地流程

```bash
zmg start
# 让 AI 开始改代码
zmg check
zmg handoff
```

如果你希望发现中高风险时命令直接失败，可以使用：

```bash
zmg check --strict
```

`zmg check` 检查的是改动风险。`zmg handoff` 会把最近一次检查结果整理成一份给下一个 agent 或未来的自己看的 Markdown 交接文档。它们都不替代编译、测试和真机验证。
