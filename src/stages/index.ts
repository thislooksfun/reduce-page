import { RemoveUnusedCssStage } from "./remove-css/stage.js";

export const allStages = [
  // FIXME: Stage 1: Bisect-remove all unnecessary elements

  // FIXME: Stage 2: Try removing intermediate elements

  // FIXME: Stage 3: Try removing attributes

  // FIXME: Stage 4: Try removing classes

  // Stage 5: Remove all unused style
  RemoveUnusedCssStage,

  // FIXME: Stage 6: Bisect-remove all unnecessary CSS
] as const;
