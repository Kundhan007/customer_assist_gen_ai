import { Controller, Get } from '@nestjs/common';
import { TestPythonService } from './test-python.service';

@Controller('test-python')
export class TestPythonController {
  constructor(private readonly testPythonService: TestPythonService) {}

  @Get('hello')
  async getHello() {
    try {
      const result = await this.testPythonService.callHelloWorld();
      return {
        success: true,
        message: 'Python script executed successfully',
        output: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to execute Python script',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Get('info')
  async getInfo() {
    try {
      const info = await this.testPythonService.getPythonInfo();
      return {
        success: true,
        message: 'Python information retrieved successfully',
        info,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get Python information',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
