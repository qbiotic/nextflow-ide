import type { RunStatus } from '../model/index.js';

export interface RunStateMachine {
  canTransition(from: RunStatus, to: RunStatus): boolean;
}