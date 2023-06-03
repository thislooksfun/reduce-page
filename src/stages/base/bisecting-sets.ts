import type { Maybe, Undoable } from "../../types.js";
import type { ReductionAction, TypedReductionAction } from "./types.js";

import assert from "node:assert";

import { ReductionStage } from "./reduction-stage.js";

export interface ReductionResult<CandidateType> extends Undoable {
  newCandidates?: CandidateType[];
}

export abstract class SetBisectionReductionStage<
  CandidateType
> extends ReductionStage {
  private candidateSets: CandidateType[][] = [];

  public override canContinue(): boolean {
    return this.candidateSets.length > 0;
  }

  /** Apply the reduction step to the given set of candidates. */
  protected abstract reduceCandidates(
    candidates: CandidateType[]
  ): ReductionResult<CandidateType>;

  override buildContinueStep(): ReductionAction {
    let candidates: Maybe<CandidateType[]>;
    let reductionAction: Maybe<ReductionResult<CandidateType>>;
    let addCandidatesAction: Maybe<Undoable>;

    return {
      apply: () => {
        candidates = this.candidateSets.pop();
        assert.ok(candidates); // TODO: Handle this better.
        reductionAction = this.reduceCandidates(candidates);

        if (reductionAction.newCandidates) {
          addCandidatesAction = this.tryAddCandidateSet(
            reductionAction.newCandidates
          );
        }
      },
      undo: async () => {
        assert.ok(candidates);
        await addCandidatesAction?.undo();
        await reductionAction?.undo();
        this.candidateSets.push(candidates);
      },
    };
  }

  public override canDiscard(): boolean {
    return this.canUndo() && this.getLastAction().type === "continue";
  }

  protected abstract discardSingleCandidate(
    candidate: CandidateType
  ): CandidateType[];

  override async buildDiscardStep(): Promise<ReductionAction> {
    let lastAction: Maybe<TypedReductionAction>;
    let removalSet: Maybe<CandidateType[]>;
    let splitAction: Maybe<Undoable>;

    return {
      apply: async () => {
        lastAction = this.getLastAction();
        assert.equal(lastAction.type, "continue");
        await lastAction.undo();

        removalSet = this.candidateSets.pop();
        assert.ok(removalSet);

        if (removalSet.length > 1) {
          const midpoint = Math.floor(removalSet.length / 2);
          const firstHalf = removalSet.slice(0, midpoint);
          const secondHalf = removalSet.slice(midpoint);

          const firstHalfAction = this.tryAddCandidateSet(firstHalf);
          const secondHalfAction = this.tryAddCandidateSet(secondHalf);

          splitAction = {
            undo: async () => {
              await firstHalfAction?.undo();
              await secondHalfAction?.undo();
            },
          };
        } else {
          const candidate = removalSet[0]!;
          const newCandidates = this.discardSingleCandidate(candidate);
          splitAction = this.tryAddCandidateSet(newCandidates);
        }
      },
      undo: async () => {
        await splitAction?.undo();
        if (removalSet) this.candidateSets.push(removalSet);
        await lastAction?.apply();
      },
    };
  }

  protected tryAddCandidateSet(candidates: CandidateType[]): Maybe<Undoable> {
    if (candidates.length === 0) return undefined;

    this.candidateSets.push(candidates);
    return {
      undo: () => {
        this.candidateSets.pop();
      },
    };
  }
}
