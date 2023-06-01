#!/usr/bin/env node

import type { ReductionStep } from "./types.js";
import type { FormatInputPathObject } from "node:path";

import assert from "node:assert";
import { readFile, writeFile } from "node:fs/promises";
import { format, parse } from "node:path";

import { startServer } from "./server.js";
import { removeUnusedCss } from "./stages/remove-css/remove-css.js";
import { parseHTML, stringifyHTML } from "./util.js";

const filepath = process.argv[2] ?? "";
if (!filepath) {
  console.log("Usage: reduce-page <file>");
  process.exit(1);
}

console.log("Reducing page", filepath);
const file = await readFile(filepath, { encoding: "utf8" });
const document = parseHTML(file);

async function saveReduction() {
  const fileParts: FormatInputPathObject = parse(filepath);
  delete fileParts.base;
  fileParts.name += ".reduced";
  const outfile = format(fileParts);
  console.log(`Saving reduced page to ${outfile}`);
  await writeFile(outfile, stringifyHTML(document));
}

const { stopServer } = await startServer(() => stringifyHTML(document));
assert.equal(document.nodeName, "#document");

async function performStep(step: ReductionStep): Promise<void> {
  const result = await step(document);
  // TODO: Refresh page & ask if still broken
  result.apply();
}

// TODO: stage 1: remove unnecessary elements
// TODO: stage 2: re-parent elements

// Stage 3: remove unused CSS
await performStep(removeUnusedCss);

// TODO: stage 4: simplify CSS selectors
//                4.1: try removing selector blocks
//                4.2: try removing rules
//                4.3: clean up any empty selectors
// TODO: stage 5: consolidate CSS selectors (i.e. if we get down to a single
//                `div` with 20 classes, join them into one class)
// TODO: repeat stages 1-5 until no changes are made

// Reduction is finished! Shut down the server and save the result.
await stopServer();
await saveReduction();
