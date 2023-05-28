import type { Document } from "./tree-adapter.js";

export type Awaitable<T> = T | PromiseLike<T>;

export type ReductionStepResult = {
  apply: () => void;
  undo: () => void;
};

export type ReductionStep = (
  document: Document
) => Awaitable<ReductionStepResult>;
