import type { Document, Element, ParentNode } from "../../tree-adapter.js";

import { isElementNode, isParentNode } from "../../tree-adapter.js";
import { parseHTML } from "../../util.js";

export type ExtractorResultDetailed = {
  attributes: {
    names: string[];
    values: string[];
  };
  classes: string[];
  ids: string[];
  tags: string[];
  undetermined: string[];
};

const makeEmptyResult = (): ExtractorResultDetailed => ({
  attributes: {
    names: [],
    values: [],
  },
  classes: [],
  ids: [],
  tags: [],
  undetermined: [],
});

const mergedExtractorResults = (
  resultLeft: ExtractorResultDetailed,
  resultRight: ExtractorResultDetailed
): ExtractorResultDetailed => {
  return {
    attributes: {
      names: [...resultLeft.attributes.names, ...resultRight.attributes.names],
      values: [
        ...resultLeft.attributes.values,
        ...resultRight.attributes.values,
      ],
    },
    classes: [...resultLeft.classes, ...resultRight.classes],
    ids: [...resultLeft.ids, ...resultRight.ids],
    tags: [...resultLeft.tags, ...resultRight.tags],
    undetermined: [],
  };
};

const getSelectorsInElement = (element: Element): ExtractorResultDetailed => {
  const result = makeEmptyResult();
  result.tags.push(element.tagName);

  for (const { name, value } of element.attrs) {
    if (name === "class") {
      result.classes.push(...value.split(" "));
    } else if (name === "id") {
      result.ids.push(...value.split(" "));
    } else {
      result.attributes.names.push(name);
      result.attributes.values.push(...value.split(" "));
    }
  }

  return result;
};

const getSelectorsInNodes = (node: ParentNode): ExtractorResultDetailed => {
  let result = makeEmptyResult();

  for (const childNode of node.childNodes) {
    if (isElementNode(childNode)) {
      result = mergedExtractorResults(result, getSelectorsInElement(childNode));
    }
    if (isParentNode(childNode)) {
      result = mergedExtractorResults(result, getSelectorsInNodes(childNode));
    }
  }

  return result;
};

const extractHtml = (input: string | Document) => {
  console.log("Extracting html from input type", typeof input);
  const document = typeof input === "string" ? parseHTML(input) : input;
  return getSelectorsInNodes(document);
};

export { extractHtml };
