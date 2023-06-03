import type { Document, Node } from "../tree-adapter.js";
import type { Maybe, Undoable } from "../types.js";
import type { ReductionAction, TypedReductionAction } from "./base.js";

import assert from "node:assert";

import { isParentNode } from "../tree-adapter.js";
import { findChildOfType } from "../util.js";
import { ReductionStage } from "./base.js";

export class TreeTrimmerStage extends ReductionStage {
  public override readonly title = "Remove Unnecessary Elements";
  private removalCandidateSets: Node[][] = [];

  constructor(document: Document) {
    super(document);

    const html = findChildOfType("html", document);
    assert.ok(html);

    const head = findChildOfType("head", html);
    if (head && head.childNodes.length > 0) {
      this.removalCandidateSets.push(head.childNodes);
    }

    const body = findChildOfType("body", html);
    if (body && body.childNodes.length > 0) {
      // TODO: Use `.toReversed()` after updating to Node v20
      const children = [...body.childNodes];
      this.removalCandidateSets.push(children.reverse());
    }
  }

  public override canContinue(): boolean {
    return this.removalCandidateSets.length > 0;
  }

  override buildContinueStep(): ReductionAction {
    let removalSet: Maybe<Node[]>;

    return {
      apply: () => {
        removalSet = this.removalCandidateSets.pop();
        assert.ok(removalSet); // TODO: Handle this better.

        for (const node of removalSet) {
          node.ignored = true;
        }
      },
      undo: async () => {
        if (!removalSet) return;

        for (const node of removalSet) {
          node.ignored = false;
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
    let removalSet: Maybe<Node[]>;
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
          if (isParentNode(node) && node.childNodes.length > 0) {
            // TODO: Use `.toReversed()` after updating to Node v20
            const children = [...node.childNodes];
            this.removalCandidateSets.push(children.reverse());

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
