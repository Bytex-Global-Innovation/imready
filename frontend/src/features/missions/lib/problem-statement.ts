import { getSelectedProblemStatementDisplay } from "./mission-progress";

export type SelectedProblemDisplay = {
  id: string;
  text: string;
};

/** Sync read of the student's chosen problem (from cached / local progress). */
export function getSelectedProblemStatement(): SelectedProblemDisplay | null {
  return getSelectedProblemStatementDisplay();
}
