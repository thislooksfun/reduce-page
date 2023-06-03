import type { ReductionStage } from "./stages/base.js";
import type { Document } from "./tree-adapter.js";
import type { Actionable, Maybe } from "./types.js";

import assert from "node:assert";

import { allStages } from "./stages/index.js";
import { parseHTML, stringifyHTML } from "./util.js";

export class PageReducer implements Actionable {
  private document: Document;
  private history: ReductionStage[] = [];
  private nextStage: number = 0;

  constructor(page: string) {
    this.document = parseHTML(page);

    // FIXME: Allow specifying which stages you want to run
  }

  public stageTitle(): Maybe<string> {
    return this.getActiveStage()?.title;
  }

  public canContinue(): boolean {
    return !!this.getActiveStage()?.canContinue();
  }

  public async continue(): Promise<void> {
    const stage = this.getActiveStage();
    assert.ok(stage);
    await stage.continue();
  }

  public canDiscard(): boolean {
    return !!this.history.at(-1)?.canDiscard();
  }

  public async discard(): Promise<void> {
    const stage = this.history.at(-1);
    assert.ok(stage);
    await stage.discard();
  }

  public canUndo(): boolean {
    return this.history.some((stage) => stage.canUndo());
  }

  public async undo(): Promise<void> {
    let stage = this.history.at(-1);
    while (!stage?.canUndo()) {
      this.history.pop();
      this.nextStage -= 1;
      if (this.history.length === 0) {
        return;
      }
      stage = this.history.at(-1);
    }

    await stage.undo();
  }

  public stringify(): string {
    return stringifyHTML(this.document);
  }

  private getActiveStage(): Maybe<ReductionStage> {
    let stage = this.history.at(-1);
    while (!stage?.canContinue()) {
      if (this.nextStage >= allStages.length) {
        return undefined;
      }

      const stageClass = allStages[this.nextStage++]!;
      stage = new stageClass(this.document);
      this.history.push(stage);
    }

    return stage;
  }
}
