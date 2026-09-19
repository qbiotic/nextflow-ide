export interface RuntimePreflightCheck {
  name: string;
  validate(): Promise<boolean>;
}

export interface RuntimePreflightError {
  checkName: string;
  message: string;
}

export class NextflowExecutablePreflight implements RuntimePreflightCheck {
  public readonly name = 'nextflow-executable';

  public constructor(private readonly executable: string) {}

  public async validate(): Promise<boolean> {
    try {
      const process = await import('node:child_process');
      await new Promise<void>((resolve, reject) => {
        process.execFile(this.executable, ['-version'], (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      return true;
    } catch {
      return false;
    }
  }
}

export class DockerExecutablePreflight implements RuntimePreflightCheck {
  public readonly name = 'docker-executable';

  public constructor(private readonly executable = 'docker') {}

  public async validate(): Promise<boolean> {
    try {
      const process = await import('node:child_process');
      await new Promise<void>((resolve, reject) => {
        process.execFile(this.executable, ['info'], (error) => error ? reject(error) : resolve());
      });
      return true;
    } catch {
      return false;
    }
  }
}