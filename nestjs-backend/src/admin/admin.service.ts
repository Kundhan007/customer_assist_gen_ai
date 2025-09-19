import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  // Mock data store for knowledge base entries
  private knowledgeBase = [
    { id: '1', filename: 'faq.md', content: 'FAQ content here' },
  ];

  uploadKnowledgeBase(file: Express.Multer.File) {
    const newEntry = {
      id: Date.now().toString(),
      filename: file.originalname,
      content: file.buffer.toString('utf-8'),
    };
    this.knowledgeBase.push(newEntry);
    return { message: 'File uploaded successfully', entry: newEntry };
  }

  deleteKnowledgeBaseEntry(id: string) {
    const index = this.knowledgeBase.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      const deletedEntry = this.knowledgeBase.splice(index, 1);
      return { message: 'Entry deleted successfully', entry: deletedEntry[0] };
    }
    return { message: 'Entry not found' };
  }
}
