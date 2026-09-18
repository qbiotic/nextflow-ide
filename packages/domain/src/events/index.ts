import type { ArtifactRecord, RunStatus } from '../model/index.js';

interface BaseExecutionEvent {
  runId: string;
  occurredAt: string;
}

export type ExecutionEvent =
  | (BaseExecutionEvent & {
      kind: 'started';
      status: 'starting' | 'running';
      commandLine: string;
    })
  | (BaseExecutionEvent & {
      kind: 'log';
      stream: 'stdout' | 'stderr';
      message: string;
    })
  | (BaseExecutionEvent & {
      kind: 'status-changed';
      status: RunStatus;
      message?: string;
    })
  | (BaseExecutionEvent & {
      kind: 'artifacts-discovered';
      artifacts: readonly ArtifactRecord[];
    });