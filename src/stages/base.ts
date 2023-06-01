import type { Document } from "../tree-adapter.js";
import type { Actionable, Awaitable, Maybe, Undoable } from "../types.js";

import assert from "node:assert";

export interface ReductionAction extends Undoable {
  apply: () => Awaitable<void>;
}

export interface TypedReductionAction extends ReductionAction {
  type: "continue" | "discard";
}

export abstract class ReductionStage implements Actionable {
  protected readonly document: Document;
  private history: TypedReductionAction[] = [];

  constructor(document: Document) {
    this.document = document;
  }

  public abstract canContinue(): boolean;

  public async continue(): Promise<void> {
    const action = await this.buildContinueStep();
    await action.apply();
    this.history.push({ ...action, type: "continue" });
  }

  public abstract canDiscard(): boolean;

  public async discard(): Promise<void> {
    const action = await this.buildDiscardStep();
    await action.apply();
    this.history.push({ ...action, type: "discard" });
  }

  public canUndo(): boolean {
    return this.history.length > 0;
  }

  public async undo(): Promise<void> {
    const action = this.history.pop();
    if (!action) return;
    await action.undo();
  }

  protected getLastAction(): TypedReductionAction {
    const action = this.history.at(-1);
    assert.ok(action);
    return action;
  }

  protected abstract buildContinueStep(): Awaitable<ReductionAction>;
  protected abstract buildDiscardStep(): Awaitable<ReductionAction>;
}

/* A ReductionStage that only ever has a single step */
export abstract class OneShotReductionStage extends ReductionStage {
  private didRun = false;

  public override canContinue(): boolean {
    return !this.didRun;
  }

  public override canDiscard(): boolean {
    return this.didRun;
  }

  public override async continue(): Promise<void> {
    await super.continue();
    this.didRun = true;
  }

  protected override buildDiscardStep(): Awaitable<ReductionAction> {
    let lastAction: Maybe<TypedReductionAction>;

    return {
      apply: async () => {
        lastAction = this.getLastAction();
        assert.equal(lastAction.type, "continue");
        await lastAction.undo();
      },
      undo: async () => {
        await lastAction?.apply();
      },
    };
  }
}
