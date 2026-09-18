import type { RunStatus } from '../model/index.js';
import { DomainInvariantError } from '../errors/index.js';

export interface RunStateMachine {
  canTransition(from: RunStatus, to: RunStatus): boolean;
  assertTransition(from: RunStatus, to: RunStatus): void;
}

const RUN_STATUS_TRANSITIONS: Readonly<Record<RunStatus, readonly RunStatus[]>> = {
  queued: ['starting', 'canceled'],
  starting: ['running', 'failed', 'canceled'],
  running: ['succeeded', 'failed', 'canceled', 'resumable'],
  succeeded: [],
  failed: ['resumable'],
  canceled: [],
  resumable: ['starting', 'running', 'canceled']
};

export function canTransitionRunStatus(from: RunStatus, to: RunStatus): boolean {
  return RUN_STATUS_TRANSITIONS[from].includes(to);
}

export function assertRunStatusTransition(from: RunStatus, to: RunStatus): void {
  if (!canTransitionRunStatus(from, to)) {
    throw new DomainInvariantError(`Invalid run status transition from ${from} to ${to}.`);
  }
}

export function isTerminalRunStatus(status: RunStatus): boolean {
  return RUN_STATUS_TRANSITIONS[status].length === 0;
}