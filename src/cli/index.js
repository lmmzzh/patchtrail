import { runInit } from "../core/config.js";
import { runStart } from "../core/baseline.js";
import { runCheck } from "../core/check.js";
import { runHandoff } from "../core/handoff.js";
import { showReport } from "../core/report.js";
import { showStatus } from "../core/status.js";
import { runTaskClose, runTaskStart } from "../core/task.js";
import { VERSION } from "../core/version.js";

const HELP_TEXT = `PatchTrail

Package: patchtrail

Daily command: zmg

Usage:
  zmg init      Set up guard files for the current project
  zmg start     Record project state before AI changes code
  zmg check     Check risk after AI changes code
  zmg check --strict
                Fail when medium or high risk is found
  zmg handoff   Generate a handoff from the latest check result
  zmg task start --goal "..."
                Start a task and record a baseline
  zmg task close
                Close the current task with a handoff

Advanced:
  zmg report    Show the latest report path
  zmg status    Show current guard state

Install once:
  npm install -g patchtrail

First run:
  zmg init
  zmg task start --goal "Describe the change"
  zmg check
  zmg handoff
  zmg task close`;

export function runCli(args, cwd) {
  const command = args[0] ?? "--help";

  try {
    switch (command) {
      case "init":
        runInit(cwd);
        break;
      case "start":
      case "baseline":
        runStart(cwd);
        break;
      case "check":
        runCheck(cwd, parseCheckOptions(args.slice(1)));
        break;
      case "handoff":
        runHandoff(cwd);
        break;
      case "task":
        runTaskCommand(cwd, args.slice(1));
        break;
      case "report":
        showReport(cwd);
        break;
      case "status":
        showStatus(cwd);
        break;
      case "-h":
      case "--help":
      case "help":
        console.log(HELP_TEXT);
        break;
      case "-v":
      case "--version":
        console.log(VERSION);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error("");
        console.error(HELP_TEXT);
        process.exitCode = 2;
    }
  } catch (error) {
    console.error("");
    console.error("PatchTrail 运行失败");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}

function runTaskCommand(cwd, args) {
  const subcommand = args[0];

  switch (subcommand) {
    case "start":
      runTaskStart(cwd, args.slice(1));
      break;
    case "close":
      runTaskClose(cwd);
      break;
    default:
      throw new Error(`不支持的 task 命令：${subcommand || ""}`);
  }
}

function parseCheckOptions(args) {
  const options = {
    strict: false
  };

  for (const arg of args) {
    if (arg === "--strict") {
      options.strict = true;
      continue;
    }

    throw new Error(`不支持的 check 参数：${arg}`);
  }

  return options;
}
