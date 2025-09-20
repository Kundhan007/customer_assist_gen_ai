import { Controller, Post, Delete, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('kb')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  uploadKnowledgeBase(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadKnowledgeBase(file);
  }

  @Delete('kb/:id')
  @Roles('admin')
  deleteKnowledgeBaseEntry(@Param('id') id: string) {
    return this.adminService.deleteKnowledgeBaseEntry(id);
  }
}
