#!/usr/bin/env node
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import type { FormatInputPathObject } from "node:path";

import chalk from "chalk";
import { readFile, writeFile } from "node:fs/promises";
import { format, parse } from "node:path";

import { buildHelp } from "./help.js";
import { acceptChar, stopKeyListener } from "./key-listener.js";
import { PageReducer } from "./reducer.js";
import { startServer } from "./server.js";

const filepath = process.argv[2] ?? "";
if (!filepath) {
  console.log(chalk.red("Usage: reduce-page <file>"));
  process.exit(1);
}

console.log("Reducing page", chalk.bold(filepath));
const file = await readFile(filepath, { encoding: "utf8" });
const reducer = new PageReducer(file);

function logAction(message: string) {
  console.log(chalk.grey(`> ${message}`));
}

function logError(message: string) {
  console.log(chalk.red(`> ${message}`));
  process.stdout.write("\u0007"); // Bell
}

function logSuccess(message: string) {
  console.log(chalk.green(`> ${message}`));
  process.stdout.write("\u0007"); // Bell
}

async function saveReduction() {
  const fileParts: FormatInputPathObject = parse(filepath);
  delete fileParts.base;
  fileParts.name += ".reduced";
  const outfile = format(fileParts);
  logAction(`Saving reduced page to ${chalk.bold(outfile)}`);
  await writeFile(outfile, reducer.stringify());
}

const { refresh, stopServer } = await startServer(() => reducer.stringify());
console.log(
  chalk.yellow(`Reduction server listening at ${chalk.bold("localhost:3000")}`)
);

let isFirst = true;

// eslint-disable-next-line no-constant-condition
runloop: while (true) {
  process.stdout.write(`What would you like to do? `);

  if (isFirst) {
    process.stdout.write(chalk.grey(`(press '${chalk.bold("?")}' for help) `));
    isFirst = false;
  }

  const key = await acceptChar();
  console.log();

  switch (key) {
    case "c":
    case "n":
      if (reducer.canContinue()) {
        logAction(
          `Performing reduction step '${chalk.bold(reducer.stageTitle()!)}'`
        );
        await reducer.continue();
        refresh();
      } else {
        logSuccess("Reduction finished!");
      }
      break;
    case "d":
      if (reducer.canDiscard()) {
        logAction("Discarding previous attempt");
        await reducer.discard();
        refresh();
      } else {
        logError("Can't discard");
      }
      break;
    case "u":
      if (reducer.canUndo()) {
        logAction("Undoing last step");
        await reducer.undo();
        refresh();
      } else {
        logError("Can't undo");
      }
      break;
    case "s":
      await saveReduction();
      break;
    case "r":
      logAction("Refreshing all connected browsers");
      refresh();
      break;
    case "q":
    case "\u0003": // ctrl+c
      await saveReduction();
      logAction("Exiting...");
      stopKeyListener();
      await stopServer();
      break runloop;
    case "/": // In case they don't hold shift
    case "?":
      console.log(`\n${buildHelp()}\n`);
      break;
    default:
      logError(`Unsupported command '${chalk.bold(key)}'`);
  }
}
