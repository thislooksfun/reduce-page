import type { Node } from "../tree-adapter.js";

import assert from "node:assert";

import { isParentNode, treeAdapter } from "../tree-adapter.js";
import { findChildOfType } from "../utilities.js";
import { IgnorableSetBisectionReductionStage } from "./base/bisecting-ignorable.js";

export class TreeTrimmerStage extends IgnorableSetBisectionReductionStage<Node> {
  public override readonly title = "Remove Unnecessary Elements";

  public override init() {
    const html = findChildOfType("html", this.document);
    assert.ok(html);

    const head = findChildOfType("head", html);
    if (head) {
      const children = treeAdapter.getChildNodes(head);
      this.tryAddCandidateSet(children);
    }

    const body = findChildOfType("body", html);
    if (body) {
      const children = treeAdapter.getChildNodes(body);
      this.tryAddCandidateSet(children.toReversed());
    }
  }

  protected override discardSingleCandidate(candidate: Node): Node[] {
    return isParentNode(candidate) ?
        treeAdapter.getChildNodes(candidate).toReversed()
      : [];
  }
}
