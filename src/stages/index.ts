import { RemoveUnusedCssStage } from "./purge-css/stage.js";
import { ReParentStage } from "./re-parent.js";
import { RemoveAttributesStage } from "./remove-attributes.js";
import { RemoveClassesStage } from "./remove-classes.js";
import { RemoveCssStage } from "./remove-css.js";
import { TreeTrimmerStage } from "./tree-trimmer.js";

export const allStages = [
  // Stage 1: Bisect-remove all unnecessary elements
  TreeTrimmerStage,

  // Stage 2: Try removing intermediate elements
  ReParentStage,

  // Stage 3: Try removing attributes
  RemoveAttributesStage,

  // Stage 4: Try removing classes
  RemoveClassesStage,

  // Stage 5: Remove all unused style
  RemoveUnusedCssStage,

  // Stage 6: Bisect-remove all unnecessary CSS
  RemoveCssStage,
] as const;
