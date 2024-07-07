import type { Class, Document, Node } from "../tree-adapter.js";

import { isClassList, isElementNode, isParentNode } from "../tree-adapter.js";
import { IgnorableSetBisectionReductionStage } from "./base/bisecting-ignorable.js";

function extractClasses(node: Node): Class[] {
  const classes: Class[] = [];

  if (isElementNode(node)) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    const classList = node.attributes.find(isClassList);
    if (classList) classes.push(...classList.values);
  }

  if (isParentNode(node)) {
    for (const child of node.childNodes) {
      classes.push(...extractClasses(child));
    }
  }

  return classes;
}

export class RemoveClassesStage extends IgnorableSetBisectionReductionStage<Class> {
  public override readonly title = "Remove Unnecessary Classes";

  constructor(document: Document) {
    super(document);

    const classes = extractClasses(document);
    this.tryAddCandidateSet(classes);
  }
}
