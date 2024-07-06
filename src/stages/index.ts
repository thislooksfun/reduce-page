import { ReParentStage } from "./re-parent.js";
import { RemoveAttributesStage } from "./remove-attributes.js";
import { RemoveUnusedCssStage } from "./remove-css/stage.js";
import { TreeTrimmerStage } from "./tree-trimmer.js";

export const allStages = [
  // Stage 1: Bisect-remove all unnecessary elements
  TreeTrimmerStage,

  // Stage 2: Try removing intermediate elements
  ReParentStage,

  // Stage 3: Try removing attributes
  RemoveAttributesStage,

  // FIXME: Stage 4: Try removing classes

  // Stage 5: Remove all unused style
  RemoveUnusedCssStage,

  // FIXME: Stage 6: Bisect-remove all unnecessary CSS
] as const;
