import type { PreparedRunCommand, RuntimeGateway, RuntimeLaunchResult, RuntimeControlResult } from '@nextflow-ide/application';
import type { Run } from '@nextflow-ide/domain';

export class RuntimeRouter implements RuntimeGateway {
  public constructor(
    private readonly local: RuntimeGateway,
    private readonly docker: RuntimeGateway
  ) {}

  public startRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.forRun(run).startRun(run, command);
  }

  public resumeRun(run: Run, command: PreparedRunCommand): Promise<RuntimeLaunchResult> {
    return this.forRun(run).resumeRun(run, command);
  }

  public stopRun(run: Run): Promise<RuntimeControlResult> {
    return this.forRun(run).stopRun(run);
  }

  private forRun(run: Run): RuntimeGateway {
    return run.configuration.runtimeMode === 'docker' ? this.docker : this.local;
  }
}