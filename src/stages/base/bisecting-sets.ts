import type { Maybe, Undoable } from "../../types.js";
import type { ReductionAction, TypedReductionAction } from "./types.js";

import assert from "node:assert";

import { ReductionStage } from "./reduction-stage.js";

export interface ReductionResult<CandidateType> extends Undoable {
  newCandidates?: CandidateType[];
}

// TODO: Make this smarter. Currently it's incredibly naïve, which also means
// that it is more annoying to use than necessary. Take the following example of
// how it works currently. Let's say 'b' is necessary to keep:
// 1. Add some candidate set [a,b]
// 2. Reduce the set [a,b] (removing both) -- this breaks because b is necessary
// 3. Discard that attempt, splitting the set into two: [a] and [b]
// 4. Reduce the set [a], leaving b alone -- a is not required, so this is fine
// Now at this point we know conclusively that b is the problem and needs to
// stay. a is gone, and we already tried removing them both back in step 1. But
// the current logic tries removing a anyway, which is two extra steps (next +
// discard) that the user has to perform.
// Ideally there would be some way of tracking this relationship, so that we can
// skip that extra attempt. It's not necessary for correctness, but it would be
// a nice QoL enhancement.
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
