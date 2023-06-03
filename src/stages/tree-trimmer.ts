import type { Document, Node } from "../tree-adapter.js";
import type { ReductionResult } from "./base/bisecting-sets.js";

import assert from "node:assert";

import { isParentNode, treeAdapter } from "../tree-adapter.js";
import { findChildOfType } from "../util.js";
import { SetBisectionReductionStage } from "./base/bisecting-sets.js";

export class TreeTrimmerStage extends SetBisectionReductionStage<Node> {
  public override readonly title = "Remove Unnecessary Elements";

  constructor(document: Document) {
    super(document);

    const html = findChildOfType("html", document);
    assert.ok(html);

    const head = findChildOfType("head", html);
    if (head) {
      const children = treeAdapter.getChildNodes(head);
      this.tryAddCandidateSet(children);
    }

    const body = findChildOfType("body", html);
    if (body) {
      const children = treeAdapter.getChildNodes(body);
      this.tryAddCandidateSet(children.reverse());
    }
  }

  protected override reduceCandidates(
    candidates: Node[]
  ): ReductionResult<Node> {
    for (const node of candidates) {
      node.ignored = true;
    }

    return {
      undo: () => {
        for (const node of candidates) {
          node.ignored = false;
        }
      },
    };
  }

  protected override discardSingleCandidate(candidate: Node): Node[] {
    return isParentNode(candidate)
      ? treeAdapter.getChildNodes(candidate).reverse()
      : [];
  }
}
