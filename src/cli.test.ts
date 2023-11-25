import { execSync, spawn } from 'child_process';

describe('cli', () => {
  const prefix = '/Users/max/loop/prisma-lint';
  const args = [
    `${prefix}/dist/cli.js`,
    '-c',
    `${prefix}/example/.prismalintrc.json`,
    `${prefix}/example/valid.prisma`,
  ];
  it('runs with exec', () => {
    execSync(`node ${args.join(' ')}`);
  });

  it('runs', async () => {
    const stderrParts: string[] = [];
    const stdoutParts: string[] = [];
    let exitCode;
    const promise = new Promise((resolve, reject): void => {
      try {
        const child = spawn('node', args);
        child.stderr.on('data', (data) => {
          stderrParts.push(data);
        });
        child.stdout.on('data', (data) => {
          const stringified: string = data.toString('utf8');
          stdoutParts.push(stringified);
        });
        child.on('error', (data) => {
          reject(data);
        });
        child.on('close', (code) => {
          exitCode = code;
          resolve(undefined);
        });
      } catch (e: unknown) {
        reject(e);
      }
    });
    await promise;
    const stderr = stderrParts.join();
    const stdout = stdoutParts.join();
    expect(stderr).toBe('');
    expect(stdout).toBe('example/valid.prisma ✔\n');
    expect(exitCode).toBe(0);
  });
});
