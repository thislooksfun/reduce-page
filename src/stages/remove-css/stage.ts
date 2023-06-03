import type { ReductionAction } from "../base/types.js";

import assert from "assert";
import { PurgeCSS } from "purgecss";

import {
  findDescendantsOfType,
  getInnerText,
  setInnerText,
} from "../../util.js";
import { OneShotReductionStage } from "../base/one-shot.js";
import { extractHtml } from "./extractor.js";

const htmlExtractor = { extensions: [".html"], extractor: extractHtml };

export class RemoveUnusedCssStage extends OneShotReductionStage {
  public override readonly title = "Remove Unused CSS";
  private pc = new PurgeCSS();

  protected override async buildContinueStep(): Promise<ReductionAction> {
    const styleNodes = await findDescendantsOfType("style", this.document);
    const styleSheets = styleNodes.map((styleNode) => getInnerText(styleNode));

    const results = await this.pc.purge({
      content: [
        {
          extension: "html",
          // @ts-expect-error -- This works, the type system just doesn't know.
          raw: this.document,
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
          setInnerText(styleNodes[index]!, result.css);
        }
      },
      undo: () => {
        for (const [index, styleNode] of styleNodes.entries()) {
          setInnerText(styleNode, styleSheets[index]!);
        }
      },
    };
  }
}
