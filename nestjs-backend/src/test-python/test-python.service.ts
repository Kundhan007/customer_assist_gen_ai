import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class TestPythonService {
  private readonly logger = new Logger(TestPythonService.name);

  async callHelloWorld(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.logger.log('Calling Python hello world script...');
      
      const pythonProcess = spawn('python3', [join(process.cwd(), 'src', 'hello_world.py')], {
        stdio: 'pipe',
      });

      let output = '';
      let error = '';

      pythonProcess.stdout?.on('data', (data) => {
        const message = data.toString();
        output += message;
        this.logger.log(`Python stdout: ${message}`);
      });

      pythonProcess.stderr?.on('data', (data) => {
        const message = data.toString();
        error += message;
        this.logger.error(`Python stderr: ${message}`);
      });

      pythonProcess.on('error', (err) => {
        this.logger.error('Python process error:', err);
        reject(err);
      });

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          this.logger.log('Python script executed successfully');
          resolve(output);
        } else {
          this.logger.error(`Python script exited with code ${code}`);
          reject(new Error(`Python script failed with exit code ${code}: ${error}`));
        }
      });
    });
  }

  async getPythonInfo(): Promise<{version: string, executable: string, cwd: string}> {
    return new Promise((resolve, reject) => {
      this.logger.log('Getting Python information...');
      
      const pythonProcess = spawn('python3', ['-c', 'import sys; import os; print(sys.version); print(sys.executable); print(os.getcwd())'], {
        stdio: 'pipe',
      });

      let output = '';

      pythonProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        this.logger.error(`Python stderr: ${data.toString()}`);
      });

      pythonProcess.on('error', (err) => {
        this.logger.error('Python process error:', err);
        reject(err);
      });

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          const lines = output.trim().split('\n');
          resolve({
            version: lines[0] || '',
            executable: lines[1] || '',
            cwd: lines[2] || ''
          });
        } else {
          reject(new Error(`Python script failed with exit code ${code}`));
        }
      });
    });
  }
}
