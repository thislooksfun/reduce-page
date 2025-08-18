import type { Ignorable, Undoable } from "../../types.js";

import { SetBisectionReductionStage } from "./bisecting-sets.js";

export interface ReductionResult<CandidateType> extends Undoable {
  newCandidates?: CandidateType[];
}

export abstract class IgnorableSetBisectionReductionStage<
  CandidateType extends Ignorable,
> extends SetBisectionReductionStage<CandidateType> {
  protected override reduceCandidates(
    candidates: CandidateType[],
  ): ReductionResult<CandidateType> {
    for (const candidate of candidates) {
      candidate.ignored = true;
    }

    return {
      undo: () => {
        for (const candidate of candidates) {
          candidate.ignored = false;
        }
      },
    };
  }

  protected override discardSingleCandidate(
    _candidate: CandidateType,
  ): CandidateType[] {
    return [];
  }
}
