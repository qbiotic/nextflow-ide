import { describe, expect, it } from 'vitest';
import { RUN_PIPELINE_COMMAND } from '../src/commands/index.js';

describe('VS Code command contract', () => {
  it('exposes the Run Pipeline command id', () => {
    expect(RUN_PIPELINE_COMMAND).toBe('nextflowIde.runPipeline');
  });
});
