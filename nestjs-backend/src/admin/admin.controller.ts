import { Controller, Post, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('kb')
  @UseInterceptors(FileInterceptor('file'))
  uploadKnowledgeBase(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadKnowledgeBase(file);
  }

  @Delete('kb/:id')
  deleteKnowledgeBaseEntry(@Param('id') id: string) {
    return this.adminService.deleteKnowledgeBaseEntry(id);
  }
}
