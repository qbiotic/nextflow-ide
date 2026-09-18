import { describe, expect, it } from 'vitest';
import {
  assertRunStatusTransition,
  canTransitionRunStatus,
  isTerminalRunStatus
} from '../src/services/index.js';

describe('run state machine', () => {
  it('allows a run to move from queued to running through starting', () => {
    expect(canTransitionRunStatus('queued', 'starting')).toBe(true);
    expect(canTransitionRunStatus('starting', 'running')).toBe(true);
  });

  it('allows failed runs to become resumable', () => {
    expect(canTransitionRunStatus('failed', 'resumable')).toBe(true);
  });

  it('rejects terminal state transitions', () => {
    expect(canTransitionRunStatus('succeeded', 'running')).toBe(false);
    expect(() => assertRunStatusTransition('succeeded', 'running')).toThrow(
      'Invalid run status transition'
    );
  });

  it('identifies terminal statuses', () => {
    expect(isTerminalRunStatus('succeeded')).toBe(true);
    expect(isTerminalRunStatus('failed')).toBe(false);
  });
});