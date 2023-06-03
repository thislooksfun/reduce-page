import type { Document, ParentNode } from "../tree-adapter.js";
import type { Maybe, Undoable } from "../types.js";
import type { ReductionAction, TypedReductionAction } from "./base/types.js";

import assert from "node:assert";

import { isParentNode, treeAdapter } from "../tree-adapter.js";
import { findChildOfType } from "../util.js";
import { ReductionStage } from "./base/reduction-stage.js";

function bypassableChildrenOf(node: ParentNode) {
  const children = treeAdapter.getChildNodes(node);
  return children.filter((c) => isParentNode(c)) as ParentNode[];
}

export class ReParentStage extends ReductionStage {
  public override readonly title = "Re-Parent Elements";
  private removalCandidateSets: ParentNode[][] = [];

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
      if (bypassableChildren.length > 0) {
        this.removalCandidateSets.push(bypassableChildren);
      }
    }

    const body = findChildOfType("body", html);
    if (body) {
      const bypassableChildren = bypassableChildrenOf(body);
      if (bypassableChildren.length > 0) {
        this.removalCandidateSets.push(bypassableChildren.reverse());
      }
    }
  }

  public override canContinue(): boolean {
    return this.removalCandidateSets.length > 0;
  }

  override buildContinueStep(): ReductionAction {
    let removalSet: Maybe<ParentNode[]>;
    let didPush = false;

    return {
      apply: () => {
        removalSet = this.removalCandidateSets.pop();
        assert.ok(removalSet); // TODO: Handle this better.

        let nextLayer: ParentNode[] = [];
        for (const node of removalSet) {
          node.bypassed = true;
          nextLayer = [...nextLayer, ...bypassableChildrenOf(node)];
        }

        if (nextLayer.length > 0) {
          didPush = true;
          this.removalCandidateSets.push(nextLayer);
        }
      },
      undo: async () => {
        if (!removalSet) return;

        for (const node of removalSet) {
          node.bypassed = false;
        }

        if (didPush) {
          this.removalCandidateSets.pop();
        }

        this.removalCandidateSets.push(removalSet);
      },
    };
  }

  public override canDiscard(): boolean {
    return this.canUndo() && this.getLastAction().type === "continue";
  }

  override async buildDiscardStep(): Promise<ReductionAction> {
    let lastAction: Maybe<TypedReductionAction>;
    let removalSet: Maybe<ParentNode[]>;
    let splitAction: Maybe<Undoable>;

    return {
      apply: async () => {
        lastAction = this.getLastAction();
        assert.equal(lastAction.type, "continue");
        await lastAction.undo();

        removalSet = this.removalCandidateSets.pop();
        assert.ok(removalSet);

        if (removalSet.length > 1) {
          const midpoint = Math.floor(removalSet.length / 2);
          const firstHalf = removalSet.slice(0, midpoint);
          const secondHalf = removalSet.slice(midpoint);
          this.removalCandidateSets.push(firstHalf, secondHalf);

          splitAction = {
            undo: () => {
              this.removalCandidateSets.pop();
              this.removalCandidateSets.pop();
            },
          };
        } else {
          const node = removalSet[0]!;

          const bypassableChildren = bypassableChildrenOf(node);
          if (bypassableChildren.length > 0) {
            this.removalCandidateSets.push(bypassableChildren.reverse());

            splitAction = {
              undo: () => {
                this.removalCandidateSets.pop();
              },
            };
          }
        }
      },
      undo: async () => {
        await splitAction?.undo();
        if (removalSet) this.removalCandidateSets.push(removalSet);
        await lastAction?.apply();
      },
    };
  }
}
