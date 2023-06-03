// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import type { Token, TreeAdapter, TreeAdapterTypeMap } from "parse5";

import { html } from "parse5";

export interface BaseNode {
  /** The name of the node. */
  nodeName: string;
  /**
   * Comment source code location info. Available if location info is enabled.
   */
  sourceCodeLocation?: Token.Location | null;

  /** Whether or not the node should be ignored when walking the AST. */
  ignored: boolean;
}

export interface NodeWithChildren extends BaseNode {
  /** The node's children. */
  childNodes: ChildNode[];

  /**
   * Whether or not this node should be bypassed when walking the AST, going
   * straight to its children instead.
   */
  bypassed: boolean;
}

export interface Document extends NodeWithChildren {
  /** The name of the node. */
  nodeName: "#document";
  /** Document mode. */
  mode: html.DOCUMENT_MODE;
}

export interface DocumentFragment extends NodeWithChildren {
  /** The name of the node. */
  nodeName: "#document-fragment";
}

export interface Element extends NodeWithChildren {
  /** Element tag name. Same as {@link tagName}. */
  nodeName: string;
  /** Element tag name. Same as {@link nodeName}. */
  tagName: string;
  /** List of element attributes. */
  attrs: Token.Attribute[];
  /** Element namespace. */
  namespaceURI: html.NS;
  /** Parent node. */
  parentNode: ParentNode | null;
}

export interface CommentNode extends BaseNode {
  /** The name of the node. */
  nodeName: "#comment";
  /** Parent node. */
  parentNode: ParentNode | null;
  /** Comment text. */
  data: string;
}

export interface TextNode extends BaseNode {
  nodeName: "#text";
  /** Parent node. */
  parentNode: ParentNode | null;
  /** Text content. */
  value: string;
}

export interface Template extends Element {
  nodeName: "template";
  tagName: "template";
  /** The content of a `template` tag. */
  content: DocumentFragment;
}

export interface DocumentType extends BaseNode {
  /** The name of the node. */
  nodeName: "#documentType";
  /** Parent node. */
  parentNode: ParentNode | null;
  /** Document type name. */
  name: string;
  /** Document type public identifier. */
  publicId: string;
  /** Document type system identifier. */
  systemId: string;
}

export type ParentNode = Document | DocumentFragment | Element | Template;
export type ChildNode =
  | Element
  | Template
  | CommentNode
  | TextNode
  | DocumentType;
export type Node = ParentNode | ChildNode;

export type NodeFromName<NodeName extends string> = NodeName extends "#comment"
  ? CommentNode
  : NodeName extends "#document-fragment"
  ? DocumentFragment
  : NodeName extends "#document"
  ? Document
  : NodeName extends "#documentType"
  ? DocumentType
  : NodeName extends "#text"
  ? TextNode
  : NodeName extends "template"
  ? Template
  : Element;

export type TreeAdapterMap = TreeAdapterTypeMap<
  Node,
  ParentNode,
  ChildNode,
  Document,
  DocumentFragment,
  Element,
  CommentNode,
  TextNode,
  Template,
  DocumentType
>;

export function isTextNode(node: Node): node is TextNode {
  return node.nodeName === "#text";
}

export function isCommentNode(node: Node): node is CommentNode {
  return node.nodeName === "#comment";
}

export function isDocumentTypeNode(node: Node): node is DocumentType {
  // eslint-disable-next-line sonarjs/no-duplicate-string
  return node.nodeName === "#documentType";
}

export function isElementNode(node: Node): node is Element {
  return Object.prototype.hasOwnProperty.call(node, "tagName");
}

export function isChildNode(node: Node): node is ChildNode {
  return "parentNode" in node;
}

export function isParentNode(node: Node): node is ParentNode {
  return "childNodes" in node;
}

export function createTextNode(value: string): TextNode {
  return {
    nodeName: "#text",
    value,
    parentNode: null,
    ignored: false,
  };
}

export const treeAdapter: TreeAdapter<TreeAdapterMap> = {
  // Node construction
  createDocument(): Document {
    return {
      nodeName: "#document",
      mode: html.DOCUMENT_MODE.NO_QUIRKS,
      childNodes: [],
      ignored: false,
      bypassed: false,
    };
  },

  createDocumentFragment(): DocumentFragment {
    return {
      nodeName: "#document-fragment",
      childNodes: [],
      ignored: false,
      bypassed: false,
    };
  },

  createElement(
    tagName: string,
    namespaceURI: html.NS,
    attributes: Token.Attribute[]
  ): Element {
    return {
      nodeName: tagName,
      tagName,
      attrs: attributes,
      namespaceURI,
      childNodes: [],
      parentNode: null,
      ignored: false,
      bypassed: false,
    };
  },

  createCommentNode(data: string): CommentNode {
    return {
      nodeName: "#comment",
      data,
      parentNode: null,
      ignored: false,
    };
  },

  // Tree mutation
  appendChild(parentNode: ParentNode, newNode: ChildNode): void {
    parentNode.childNodes.push(newNode);
    newNode.parentNode = parentNode;
  },

  insertBefore(
    parentNode: ParentNode,
    newNode: ChildNode,
    referenceNode: ChildNode
  ): void {
    const insertionIndex = parentNode.childNodes.indexOf(referenceNode);

    parentNode.childNodes.splice(insertionIndex, 0, newNode);
    newNode.parentNode = parentNode;
  },

  setTemplateContent(
    templateElement: Template,
    contentElement: DocumentFragment
  ): void {
    templateElement.content = contentElement;
  },

  getTemplateContent(templateElement: Template): DocumentFragment {
    return templateElement.content;
  },

  setDocumentType(
    document: Document,
    name: string,
    publicId: string,
    systemId: string
  ): void {
    const doctypeNode = document.childNodes.find(
      (node): node is DocumentType => node.nodeName === "#documentType"
    );

    if (doctypeNode) {
      doctypeNode.name = name;
      doctypeNode.publicId = publicId;
      doctypeNode.systemId = systemId;
    } else {
      const node: DocumentType = {
        nodeName: "#documentType",
        name,
        publicId,
        systemId,
        parentNode: null,
        ignored: false,
      };
      treeAdapter.appendChild(document, node);
    }
  },

  setDocumentMode(document: Document, mode: html.DOCUMENT_MODE): void {
    document.mode = mode;
  },

  getDocumentMode(document: Document): html.DOCUMENT_MODE {
    return document.mode;
  },

  detachNode(node: ChildNode): void {
    if (node.parentNode) {
      const index = node.parentNode.childNodes.indexOf(node);

      node.parentNode.childNodes.splice(index, 1);
      node.parentNode = null;
    }
  },

  insertText(parentNode: ParentNode, text: string): void {
    if (parentNode.childNodes.length > 0) {
      const previousNode = parentNode.childNodes.at(-1);

      if (previousNode && treeAdapter.isTextNode(previousNode)) {
        previousNode.value += text;
        return;
      }
    }

    treeAdapter.appendChild(parentNode, createTextNode(text));
  },

  insertTextBefore(
    parentNode: ParentNode,
    text: string,
    referenceNode: ChildNode
  ): void {
    const previousNode =
      parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];

    if (previousNode && treeAdapter.isTextNode(previousNode)) {
      previousNode.value += text;
    } else {
      treeAdapter.insertBefore(parentNode, createTextNode(text), referenceNode);
    }
  },

  adoptAttributes(recipient: Element, attributes: Token.Attribute[]): void {
    const recipientAttributesMap = new Set(
      recipient.attrs.map((attribute) => attribute.name)
    );

    for (const attribute of attributes) {
      if (!recipientAttributesMap.has(attribute.name)) {
        recipient.attrs.push(attribute);
      }
    }
  },

  // Tree traversing
  getFirstChild(node: ParentNode): null | ChildNode {
    return this.getChildNodes(node)[0] ?? null;
  },

  getChildNodes(node: ParentNode): ChildNode[] {
    return node.childNodes
      .filter((c) => !c.ignored)
      .flatMap((c) =>
        isParentNode(c) && c.bypassed ? this.getChildNodes(c) : c
      );
  },

  getParentNode(node: ChildNode): null | ParentNode {
    let parent = node.parentNode;
    while (parent?.bypassed) {
      parent = isChildNode(parent) ? parent.parentNode : null;
    }
    return parent;
  },

  getAttrList(element: Element): Token.Attribute[] {
    return element.attrs;
  },

  // Node data
  getTagName(element: Element): string {
    return element.tagName;
  },

  getNamespaceURI(element: Element): html.NS {
    return element.namespaceURI;
  },

  getTextNodeContent(textNode: TextNode): string {
    return textNode.value;
  },

  getCommentNodeContent(commentNode: CommentNode): string {
    return commentNode.data;
  },

  getDocumentTypeNodeName(doctypeNode: DocumentType): string {
    return doctypeNode.name;
  },

  getDocumentTypeNodePublicId(doctypeNode: DocumentType): string {
    return doctypeNode.publicId;
  },

  getDocumentTypeNodeSystemId(doctypeNode: DocumentType): string {
    return doctypeNode.systemId;
  },

  // Node types
  isTextNode,
  isCommentNode,
  isDocumentTypeNode,
  isElementNode,

  // Source code location
  setNodeSourceCodeLocation(
    node: Node,
    location: Token.ElementLocation | null
  ): void {
    node.sourceCodeLocation = location;
  },

  getNodeSourceCodeLocation(
    node: Node
  ): Token.ElementLocation | undefined | null {
    return node.sourceCodeLocation;
  },

  updateNodeSourceCodeLocation(
    node: Node,
    endLocation: Token.ElementLocation
  ): void {
    node.sourceCodeLocation = { ...node.sourceCodeLocation, ...endLocation };
  },
};
