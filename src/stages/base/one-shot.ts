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

  protected abstract buildReduction(): Awaitable<ReductionAction>;

  protected override init() {
    // One-shot reduction stages typically have no initialization.
  }

  protected override async buildContinueStep(): Promise<ReductionAction> {
    const reduction = await this.buildReduction();

    return {
      apply: async () => {
        await reduction.apply();
        this.didRun = true;
      },
      undo: async () => {
        this.didRun = false;
        await reduction.undo();
      },
    };
  }

  protected override buildDiscardStep(): Awaitable<ReductionAction> {
    let lastAction: Maybe<TypedReductionAction>;

    return {
      apply: async () => {
        lastAction = this.getLastAction();
        assert.equal(lastAction.type, "continue");
        await lastAction.undo();
        this.didRun = true;
      },
      undo: async () => {
        this.didRun = false;
        await lastAction?.apply();
      },
    };
  }
}
