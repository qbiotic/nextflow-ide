import type {
  PreparedRunCommand
} from '@nextflow-ide/application';
import type { RunConfiguration, Run } from '@nextflow-ide/domain';
import type { RuntimeCommandFactory } from '@nextflow-ide/application';

export interface CommandPreview {
  executable: string;
  args: string[];
  displayCommand: string;
}

export interface RuntimeCommandBuilderOptions {
  nextflowExecutable?: string;
  dockerExecutable?: string;
  dockerImage?: string;
}

export class NextflowCommandBuilder implements RuntimeCommandFactory {
  private readonly options: Required<RuntimeCommandBuilderOptions>;

  public constructor(options: RuntimeCommandBuilderOptions = {}) {
    this.options = {
      nextflowExecutable: options.nextflowExecutable ?? 'nextflow',
      dockerExecutable: options.dockerExecutable ?? 'docker',
      dockerImage: options.dockerImage ?? 'nextflow/nextflow:latest'
    };
  }

  public async prepareRunCommand(configuration: RunConfiguration): Promise<PreparedRunCommand> {
    const args = this.buildNextflowArgs(configuration);
    const workingDirectory = configuration.workingDirectory ?? configuration.workspaceRoot;

    if (configuration.runtimeMode === 'local') {
      return this.createCommand(
        this.options.nextflowExecutable,
        args,
        workingDirectory,
        configuration.environment
      );
    }

    return this.createDockerCommand(configuration, args, workingDirectory);
  }

  public async prepareResumeCommand(run: Run): Promise<PreparedRunCommand> {
    return this.prepareRunCommand({
      ...run.configuration,
      resumeEnabled: true
    });
  }

  private buildNextflowArgs(configuration: RunConfiguration): string[] {
    const args = ['run', configuration.entrypointPath];

    if (configuration.profileNames.length > 0) {
      args.push('-profile', configuration.profileNames.join(','));
    }

    if (configuration.paramsFilePath) {
      args.push('--params-file', configuration.paramsFilePath);
    }

    if (configuration.resumeEnabled) {
      args.push('-resume');
    }

    args.push(...configuration.args);
    return args;
  }

  private createDockerCommand(
    configuration: RunConfiguration,
    nextflowArgs: readonly string[],
    workingDirectory: string
  ): PreparedRunCommand {
    const args = [
      'run',
      '--rm',
      '-v',
      `${configuration.workspaceRoot}:${configuration.workspaceRoot}`,
      '-w',
      workingDirectory,
      this.options.dockerImage,
      ...nextflowArgs
    ];

    return this.createCommand(
      this.options.dockerExecutable,
      args,
      workingDirectory,
      configuration.environment
    );
  }

  private createCommand(
    executable: string,
    args: readonly string[],
    workingDirectory: string,
    environment: Readonly<Record<string, string>>
  ): PreparedRunCommand {
    return {
      executable,
      args,
      workingDirectory,
      environment,
      displayCommand: [executable, ...args].map(quoteForDisplay).join(' ')
    };
  }
}

function quoteForDisplay(value: string): string {
  if (/^[a-zA-Z0-9_./:@%+=,-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
}