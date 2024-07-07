import type { Attribute, Document, Node } from "../tree-adapter.js";
import type { ReductionResult } from "./base/bisecting-sets.js";

import { isElementNode, isParentNode } from "../tree-adapter.js";
import { SetBisectionReductionStage } from "./base/bisecting-sets.js";

function extractAttributes(node: Node): Attribute[] {
  const attributes: Attribute[] = [];

  if (isElementNode(node)) {
    attributes.push(...node.attributes);
  }

  if (isParentNode(node)) {
    for (const child of node.childNodes) {
      attributes.push(...extractAttributes(child));
    }
  }

  return attributes;
}

export class RemoveAttributesStage extends SetBisectionReductionStage<Attribute> {
  public override readonly title = "Remove Unnecessary Attributes";

  constructor(document: Document) {
    super(document);

    const attributes = extractAttributes(document);
    this.tryAddCandidateSet(attributes);
  }

  protected override reduceCandidates(
    candidates: Attribute[]
  ): ReductionResult<Attribute> {
    for (const attribute of candidates) {
      attribute.ignored = true;
    }

    return {
      undo: () => {
        for (const attribute of candidates) {
          attribute.ignored = false;
        }
      },
    };
  }

  protected override discardSingleCandidate(
    _candidate: Attribute
  ): Attribute[] {
    return [];
  }
}
