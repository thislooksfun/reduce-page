import type { Element as HTMLElement } from "../tree-adapter.js";
import type { ReductionResult } from "./base/bisecting-sets.js";
import type {
  ChildNode as CSSChildNode,
  Container as CSSContainer,
  Node as CSSNode,
  Root as CSSRoot,
} from "postcss";

import assert from "node:assert";
import { parse as parseCSS } from "postcss";

import { isClassList, isElementNode, isTextNode } from "../tree-adapter.js";
import {
  findDescendantsOfType,
  getInnerText,
  visitDescendants,
} from "../util.js";
import { SetBisectionReductionStage } from "./base/bisecting-sets.js";

interface StyleSource {
  type: "element" | "attribute";
  element: HTMLElement;
  css: CSSRoot;
}

function isCSSContainer(node: CSSNode): node is CSSContainer {
  return "nodes" in node;
}

export class RemoveCssStage extends SetBisectionReductionStage<CSSChildNode> {
  public override readonly title = "Remove Unnecessary CSS";

  private readonly sources: StyleSource[] = [];

  public override async init() {
    const styleNodes = await findDescendantsOfType("style", this.document);
    for (const node of styleNodes) {
      const textContents = getInnerText(node);
      const css = parseCSS(textContents);
      this.sources.push({ type: "element", element: node, css });
    }

    await visitDescendants(this.document, (node) => {
      if (!isElementNode(node)) return;

      const styleAttribute = node.attributes.find(
        (attribute) => attribute.name === "style"
      );
      if (!styleAttribute) return;
      // This shouldn't be possible, but it makes TS happy to check.
      if (isClassList(styleAttribute)) return;

      const css = parseCSS(styleAttribute.value);
      this.sources.push({ type: "attribute", element: node, css });
    });

    const initialSet = this.sources.flatMap((source) => source.css.nodes);
    this.tryAddCandidateSet(initialSet);
  }

  protected override reduceCandidates(
    candidates: CSSChildNode[]
  ): ReductionResult<CSSChildNode> {
    const undoFns: Array<() => void> = [];
    for (const candidate of candidates) {
      const parent = candidate.parent;
      assert.ok(parent);
      const oldIndex = parent.index(candidate);

      candidate.remove();

      // Add the undo functions in reverse order so they unwind correctly.
      undoFns.unshift(() => {
        if (oldIndex === parent.nodes?.length) {
          parent.append(candidate);
        } else {
          // eslint-disable-next-line unicorn/prefer-modern-dom-apis
          parent.insertBefore(oldIndex, candidate);
        }
      });
    }

    this.reconcile();

    return {
      undo: () => {
        for (const undoOne of undoFns) {
          undoOne();
        }

        this.reconcile();
      },
    };
  }

  protected override discardSingleCandidate(
    candidate: CSSChildNode
  ): CSSChildNode[] {
    if (!isCSSContainer(candidate)) return [];
    return candidate.nodes ?? [];
  }

  private reconcile(): void {
    for (const source of this.sources) {
      if (source.type === "attribute") {
        const attribute = source.element.attributes.find(
          (attribute) => attribute.name === "style"
        );
        assert.ok(attribute && !isClassList(attribute));
        attribute.value = source.css.toResult().toString();
      } else {
        const children = source.element.childNodes;
        assert.ok(children.length === 1);
        const textNode = children[0]!;
        assert.ok(isTextNode(textNode));
        textNode.value = source.css.toResult().toString();
      }
    }
  }
}
