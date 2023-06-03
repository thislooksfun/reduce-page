import type { Document, ParentNode } from "../tree-adapter.js";
import type { ReductionResult } from "./base/bisecting-sets.js";

import assert from "node:assert";

import { isParentNode, treeAdapter } from "../tree-adapter.js";
import { findChildOfType } from "../util.js";
import { SetBisectionReductionStage } from "./base/bisecting-sets.js";

function bypassableChildrenOf(node: ParentNode) {
  const children = treeAdapter.getChildNodes(node);
  return children.filter((c) => isParentNode(c)) as ParentNode[];
}

export class ReParentStage extends SetBisectionReductionStage<ParentNode> {
  public override readonly title = "Re-Parent Elements";

  constructor(document: Document) {
    super(document);

    const html = findChildOfType("html", document);
    assert.ok(html);

    const head = findChildOfType("head", html);
    if (head) {
      const bypassableChildren = bypassableChildrenOf(head).filter(
        // Don't mess with head elements that just have text contents.
        (element) => !["script", "style", "title"].includes(element.nodeName)
      );
      this.tryAddCandidateSet(bypassableChildren);
    }

    const body = findChildOfType("body", html);
    if (body) {
      const bypassableChildren = bypassableChildrenOf(body);
      this.tryAddCandidateSet(bypassableChildren);
    }
  }

  protected override reduceCandidates(
    candidates: ParentNode[]
  ): ReductionResult<ParentNode> {
    let nextLayer: ParentNode[] = [];
    for (const node of candidates) {
      node.bypassed = true;
      nextLayer = [...nextLayer, ...bypassableChildrenOf(node)];
    }

    return {
      newCandidates: nextLayer,
      undo: () => {
        for (const node of candidates) {
          node.bypassed = false;
        }
      },
    };
  }

  protected override discardSingleCandidate(
    candidate: ParentNode
  ): ParentNode[] {
    return bypassableChildrenOf(candidate).reverse();
  }
}
