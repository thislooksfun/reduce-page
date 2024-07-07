import type { Document } from "../../tree-adapter.js";
import type { Actionable, Awaitable } from "../../types.js";
import type { ReductionAction, TypedReductionAction } from "./types.js";

import assert from "node:assert";

export abstract class ReductionStage implements Actionable {
  public abstract readonly title: string;
  protected readonly document: Document;
  private history: TypedReductionAction[] = [];

  constructor(document: Document) {
    this.document = document;
    this.init();
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

  protected abstract init(): void;

  protected abstract buildContinueStep(): Awaitable<ReductionAction>;
  protected abstract buildDiscardStep(): Awaitable<ReductionAction>;
}
