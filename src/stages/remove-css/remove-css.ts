import type { ReductionStep } from "../../types.js";

import assert from "assert";
import { PurgeCSS } from "purgecss";

import { findChildrenOfType, getInnerText, setInnerText } from "../../util.js";
import { extractHtml } from "./extractor.js";

const htmlExtractor = { extensions: [".html"], extractor: extractHtml };

const pc = new PurgeCSS();
export const removeUnusedCss: ReductionStep = async (document) => {
  const styleNodes = await findChildrenOfType("style", document);
  const styleSheets = styleNodes.map((styleNode) => getInnerText(styleNode));

  const results = await pc.purge({
    content: [
      {
        extension: "html",
        // @ts-expect-error -- This works, the type system just doesn't know.
        raw: document,
      },
    ],
    css: styleSheets.map((ss) => ({ raw: ss })),
    extractors: [htmlExtractor],
  });
  // Sanity check.
  assert.equal(styleSheets.length, results.length);

  return {
    apply: () => {
      for (const [index, result] of results.entries()) {
        setInnerText(styleNodes[index], result.css);
      }
    },
    undo: () => {
      for (const [index, styleNode] of styleNodes.entries()) {
        setInnerText(styleNode, styleSheets[index]);
      }
    },
  };
};
