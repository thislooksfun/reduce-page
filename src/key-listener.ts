import type { Maybe } from "./types.js";

import chalk from "chalk";
import assert from "node:assert";

const stdin = process.stdin;

let handler: Maybe<(key: string) => void>;

function handleData(key: string) {
  process.stdout.write(chalk.gray(key));

  if (handler) {
    handler(key);
    handler = undefined;
  }
}

export async function acceptChar(): Promise<string> {
  if (!stdin.isRaw) startKeyListener();

  assert.ok(!handler, "handler already defined");
  return new Promise((resolve) => {
    handler = resolve;
  });
}

export function startKeyListener(): void {
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.on("data", handleData);
  stdin.resume();
}

export function stopKeyListener(): void {
  stdin.pause();
  stdin.off("data", handleData);
  stdin.setEncoding("binary");
  stdin.setRawMode(false);
}
