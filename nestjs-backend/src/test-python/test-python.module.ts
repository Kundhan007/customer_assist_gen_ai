import { Module } from '@nestjs/common';
import { TestPythonService } from './test-python.service';
import { TestPythonController } from './test-python.controller';

@Module({
  controllers: [TestPythonController],
  providers: [TestPythonService],
  exports: [TestPythonService],
})
export class TestPythonModule {}
