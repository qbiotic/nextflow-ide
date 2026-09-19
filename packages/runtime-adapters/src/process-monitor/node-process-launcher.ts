import { spawn } from 'node:child_process';
import type { ManagedProcess, ProcessLauncher, ProcessOutputChunk } from './index.js';

export class NodeProcessLauncher implements ProcessLauncher {
  public launch(
    executable: string,
    args: readonly string[],
    options: { cwd: string; env: Readonly<Record<string, string>> }
  ): ManagedProcess {
    const child = spawn(executable, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    return {
      pid: child.pid,
      onOutput(listener: (chunk: ProcessOutputChunk) => void): void {
        child.stdout?.on('data', (data: Buffer) => listener({ stream: 'stdout', text: data.toString() }));
        child.stderr?.on('data', (data: Buffer) => listener({ stream: 'stderr', text: data.toString() }));
      },
      onExit(listener): void {
        child.on('exit', listener);
      },
      kill(signal = 'SIGTERM'): void {
        child.kill(signal);
      }
    };
  }
}