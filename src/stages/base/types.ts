import type { Awaitable, Undoable } from "../../types.js";

export interface ReductionAction extends Undoable {
  apply: () => Awaitable<void>;
}

export interface TypedReductionAction extends ReductionAction {
  type: "continue" | "discard";
}
