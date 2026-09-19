export interface CommandContribution {
  id: string;
  title: string;
}

export const commandContributions: CommandContribution[] = [];

export const RUN_PIPELINE_COMMAND = 'nextflowIde.runPipeline';
export const RESUME_RUN_COMMAND = 'nextflowIde.resumeRun';
export const STOP_RUN_COMMAND = 'nextflowIde.stopRun';
export const SHOW_RUN_DETAILS_COMMAND = 'nextflowIde.showRunDetails';
export const OPEN_ARTIFACT_COMMAND = 'nextflowIde.openArtifact';