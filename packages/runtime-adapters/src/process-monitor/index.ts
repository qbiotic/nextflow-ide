export interface ProcessOutputChunk {
  stream: 'stdout' | 'stderr';
  text: string;
}

export interface ManagedProcess {
  readonly pid?: number;
  onOutput(listener: (chunk: ProcessOutputChunk) => void): void;
  onExit(listener: (exitCode: number | null, signal: string | null) => void): void;
  kill(signal?: NodeJS.Signals): void;
}

export interface ProcessLauncher {
  launch(
    executable: string,
    args: readonly string[],
    options: { cwd: string; env: Readonly<Record<string, string>> }
  ): ManagedProcess;
}