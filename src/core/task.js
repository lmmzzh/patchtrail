import fs from "node:fs";
import path from "node:path";
import { runStart, timestampForFile } from "./baseline.js";
import { exists, ensureDir, readJson, writeJson } from "./fs-utils.js";
import { runHandoff } from "./handoff.js";
import { CURRENT_TASK, LATEST_CHECK, LATEST_HANDOFF, RULES_FILE, TASKS_DIR, guardPath } from "./paths.js";

export function runTaskStart(root, args) {
  ensureInitialized(root);

  if (currentTask(root)) {
    throw new Error("当前已有未关闭任务，请先运行：zmg task close");
  }

  const goal = parseTaskStartArgs(args).goal;
  const timestamp = timestampForFile();
  const id = `${timestamp}-${slugifyGoal(goal)}`;
  const taskDir = guardPath(root, TASKS_DIR, id);
  const taskDirRelative = relativePath(root, taskDir);
  const task = {
    id,
    goal,
    status: "active",
    createdAt: new Date().toISOString(),
    taskDir: taskDirRelative,
    allow: [],
    deny: [],
    baselineCreated: false
  };

  ensureDir(taskDir);
  writeJson(guardPath(root, TASKS_DIR, CURRENT_TASK), task);
  fs.writeFileSync(path.join(taskDir, "task-capsule.md"), renderTaskCapsule(task), "utf8");
  fs.writeFileSync(path.join(taskDir, "notes.md"), renderTaskNotes(), "utf8");

  runStart(root, { quiet: true });

  const updatedTask = {
    ...task,
    baselineCreated: true
  };
  writeJson(guardPath(root, TASKS_DIR, CURRENT_TASK), updatedTask);

  console.log("");
  console.log("任务已开始。");
  console.log(`任务目录：${taskDirRelative}`);
  console.log("");
  console.log("改完代码后运行：");
  console.log("zmg check");
  console.log("zmg handoff");
  console.log("zmg task close");
}

export function runTaskClose(root) {
  const task = currentTask(root);
  if (!task) {
    throw new Error("当前没有未关闭任务，请先运行：zmg task start --goal \"...\"");
  }

  const latestCheckPath = guardPath(root, LATEST_CHECK);
  if (!exists(latestCheckPath)) {
    throw new Error("还没有检查结果，请先运行：zmg check");
  }

  const handoff = runHandoff(root);
  const taskDir = path.join(root, task.taskDir);
  const taskHandoffPath = path.join(taskDir, "handoff.md");
  const latestHandoffPath = guardPath(root, LATEST_HANDOFF);
  const closedTask = {
    ...task,
    status: "closed",
    closedAt: new Date().toISOString(),
    handoffPath: relativePath(root, taskHandoffPath)
  };

  ensureDir(taskDir);
  fs.copyFileSync(latestHandoffPath, taskHandoffPath);
  writeJson(path.join(taskDir, "task.json"), closedTask);
  fs.unlinkSync(guardPath(root, TASKS_DIR, CURRENT_TASK));

  console.log("");
  console.log("任务已关闭。");
  console.log(`任务交接：${closedTask.handoffPath}`);
  console.log(`全局交接：${handoff.latest_handoff_path}`);
}

export function currentTask(root) {
  const currentTaskPath = guardPath(root, TASKS_DIR, CURRENT_TASK);
  if (!exists(currentTaskPath)) return null;

  const task = readJson(currentTaskPath);
  if (task.status !== "active") return null;
  return task;
}

function ensureInitialized(root) {
  if (!exists(guardPath(root, RULES_FILE))) {
    throw new Error("还没有接入当前项目，请先在项目根目录运行：zmg init");
  }
}

function parseTaskStartArgs(args) {
  let goal = "";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--goal") {
      goal = args[index + 1] ?? "";
      index += 1;
      continue;
    }

    throw new Error(`不支持的 task start 参数：${arg}`);
  }

  if (!goal.trim()) {
    throw new Error("请提供任务目标：zmg task start --goal \"...\"");
  }

  return {
    goal: goal.trim()
  };
}

function slugifyGoal(goal) {
  const slug = goal
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || "task";
}

function renderTaskCapsule(task) {
  return `# Task Capsule

## Goal

${task.goal}

## Scope

Allowed:
- Not specified yet.

Not allowed:
- Not specified yet.

## Current Progress

- Task created by zmg task start.
- Baseline recorded.

## Next Step

Let the AI change code, then run:

\`\`\`bash
zmg check
zmg handoff
zmg task close
\`\`\`
`;
}

function renderTaskNotes() {
  return `# Task Notes

- Add notes here while working on this task.
`;
}

function relativePath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}
