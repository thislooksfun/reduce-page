import type { Awaitable, Maybe } from "../../types.js";
import type { ReductionAction, TypedReductionAction } from "./types.js";

import assert from "node:assert";

import { ReductionStage } from "./reduction-stage.js";

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
