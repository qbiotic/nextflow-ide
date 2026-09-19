import type { RunConfiguration } from '@nextflow-ide/domain';
import { describe, expect, it } from 'vitest';
import { NextflowCommandBuilder } from '../src/command-builder/index.js';

const baseConfiguration: RunConfiguration = {
  workspaceRoot: '/workspace/pipeline with spaces',
  entrypointPath: '/workspace/pipeline with spaces/main.nf',
  runtimeMode: 'local',
  profileNames: [],
  resumeEnabled: false,
  args: [],
  environment: { NF_TEST: 'true' }
};

describe('NextflowCommandBuilder', () => {
  it('builds a local command with profiles, params, and resume', async () => {
    const builder = new NextflowCommandBuilder({ nextflowExecutable: '/bin/nextflow' });

    const command = await builder.prepareRunCommand({
      ...baseConfiguration,
      profileNames: ['standard', 'docker'],
      paramsFilePath: '/workspace/pipeline with spaces/params.json',
      resumeEnabled: true,
      args: ['--input', 'reads.fastq']
    });

    expect(command.executable).toBe('/bin/nextflow');
    expect(command.args).toEqual([
      'run',
      '/workspace/pipeline with spaces/main.nf',
      '-profile',
      'standard,docker',
      '--params-file',
      '/workspace/pipeline with spaces/params.json',
      '-resume',
      '--input',
      'reads.fastq'
    ]);
    expect(command.workingDirectory).toBe(baseConfiguration.workspaceRoot);
    expect(command.environment).toEqual(baseConfiguration.environment);
    expect(command.displayCommand).toContain("'/workspace/pipeline with spaces/main.nf'");
  });

  it('builds a Docker command without changing the Nextflow arguments', async () => {
    const builder = new NextflowCommandBuilder({ dockerImage: 'nextflow:test' });

    const command = await builder.prepareRunCommand({
      ...baseConfiguration,
      runtimeMode: 'docker'
    });

    expect(command.executable).toBe('docker');
    expect(command.args).toEqual([
      'run',
      '--rm',
      '-v',
      '/workspace/pipeline with spaces:/workspace/pipeline with spaces',
      '-w',
      '/workspace/pipeline with spaces',
      'nextflow:test',
      'nextflow',
      'run',
      '/workspace/pipeline with spaces/main.nf'
    ]);
  });

  it('forces resume when preparing a resume command', async () => {
    const builder = new NextflowCommandBuilder();
    const run = {
      id: 'run-001',
      configuration: baseConfiguration,
      status: 'resumable' as const,
      artifacts: [],
      timestamps: {
        createdAt: '2026-09-19T00:00:00.000Z',
        updatedAt: '2026-09-19T00:00:00.000Z'
      }
    };

    const command = await builder.prepareResumeCommand(run);

    expect(command.args).toContain('-resume');
  });
});