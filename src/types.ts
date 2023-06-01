export type Awaitable<T> = T | PromiseLike<T>;

export type Maybe<T> = T | undefined;

export interface Undoable {
  undo: () => Awaitable<void>;
}

export interface Actionable extends Required<Undoable> {
  canContinue: () => boolean;
  continue: () => Awaitable<void>;
  canDiscard: () => boolean;
  discard: () => Awaitable<void>;
  canUndo: () => boolean;
}
