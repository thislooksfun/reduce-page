import type { Attribute, Document, Node } from "../tree-adapter.js";

import { isElementNode, isParentNode } from "../tree-adapter.js";
import { IgnorableSetBisectionReductionStage } from "./base/bisecting-ignorable.js";

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

export class RemoveAttributesStage extends IgnorableSetBisectionReductionStage<Attribute> {
  public override readonly title = "Remove Unnecessary Attributes";

  constructor(document: Document) {
    super(document);

    const attributes = extractAttributes(document);
    this.tryAddCandidateSet(attributes);
  }
}
