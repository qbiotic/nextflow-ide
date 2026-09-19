import type { Run } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import { toRunListItems } from '../src/views/run-list-model.js';

function createRun(id: string, updatedAt: string, status: Run['status']): Run {
  return {
    id,
    configuration: {
      workspaceRoot: '/workspace',
      entrypointPath: '/workspace/main.nf',
      runtimeMode: 'local',
      profileNames: [],
      resumeEnabled: false,
      args: [],
      environment: {}
    },
    status,
    artifacts: [],
    timestamps: { createdAt: updatedAt, updatedAt }
  };
}

describe('run list model', () => {
  it('sorts runs newest first and preserves status badges', () => {
    expect(toRunListItems([
      createRun('older', '2026-09-19T00:00:00.000Z', 'failed'),
      createRun('newer', '2026-09-19T01:00:00.000Z', 'running')
    ])).toEqual([
      { id: 'newer', status: 'running', description: 'running' },
      { id: 'older', status: 'failed', description: 'failed' }
    ]);
  });
});