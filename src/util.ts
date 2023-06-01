import type {
  Document,
  Element,
  Node,
  NodeFromName,
  ParentNode,
} from "./tree-adapter.js";
import type { Awaitable, Maybe } from "./types.js";

import { parse, serialize } from "parse5";
import stripBom from "strip-bom";

import {
  createTextNode,
  isParentNode,
  isTextNode,
  treeAdapter,
} from "./tree-adapter.js";

export function parseHTML(input: string): Document {
  return parse(stripBom(input), { treeAdapter });
}

export function stringifyHTML(document: Document): string {
  return serialize(document, { treeAdapter });
}

export async function visitDescendants(
  node: ParentNode,
  visit: (node: Node) => Awaitable<void>
): Promise<void> {
  for (const childNode of node.childNodes) {
    await visit(childNode);
    if (isParentNode(childNode)) {
      await visitDescendants(childNode, visit);
    }
  }
}

export async function visitDescendantsOfType<
  NodeName extends string,
  NodeType = NodeFromName<NodeName>
>(
  type: NodeName,
  node: ParentNode,
  visit: (node: NodeType) => Awaitable<void>
): Promise<void> {
  await visitDescendants(node, async (visitedNode) => {
    if (visitedNode.nodeName === type) {
      await visit(visitedNode as NodeType);
    }
  });
}

export async function findDescendantsOfType<
  NodeName extends string,
  NodeType = NodeFromName<NodeName>
>(type: NodeName, node: ParentNode): Promise<NodeType[]> {
  const nodes: NodeType[] = [];
  await visitDescendantsOfType<NodeName, NodeType>(type, node, (foundNode) => {
    nodes.push(foundNode);
  });
  return nodes;
}

export function findChildOfType<
  NodeName extends string,
  NodeType = NodeFromName<NodeName>
>(name: NodeName, node: ParentNode): Maybe<NodeType> {
  const match = node.childNodes.find((c) => c.nodeName === name);
  return match as Maybe<NodeType>;
}

function isTextParent(node: ParentNode): boolean {
  return (
    node.childNodes.length > 0 &&
    node.childNodes.every((child) => isTextNode(child))
  );
}

export function getInnerText(element: Element): string {
  let text = "";

  for (const childNode of element.childNodes) {
    if (!isTextNode(childNode)) {
      throw new Error(
        `Invalid child type encountered. Expected '#text', got '${childNode.nodeName}'`
      );
    }

    text += childNode.value;
  }

  return text;
}

export function setInnerText(element: Element, text: string): void {
  if (element.childNodes.length > 0 && !isTextParent(element)) {
    throw new Error("Trying to override text inside a non text parent node");
  }

  element.childNodes = [createTextNode(text)];
}
