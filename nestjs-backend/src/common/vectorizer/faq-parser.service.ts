import { Injectable } from '@nestjs/common';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  textChunk: string;
}

@Injectable()
export class FaqParserService {
  parseFAQ(content: string): FAQItem[] {
    const lines = content.split('\n').filter(line => line.trim());
    const faqItems: FAQItem[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      // Match pattern: "number. Question? Answer."
      const match = line.match(/^(\d+)\.\s+(.+?)\s+(.+)$/);
      
      if (match) {
        const [, id, questionPart, answerPart] = match;
        
        // Extract question (everything before the question mark)
        const questionMatch = questionPart?.match(/^(.+?)\?$/);
        const question = questionMatch ? questionMatch[1] : questionPart || '';
        
        // The answer is everything after the question
        const answer = answerPart || '';
        
        // Create text chunk for vectorization
        const textChunk = `Question: ${question}\nAnswer: ${answer}`;
        
        faqItems.push({
          id: (id || '').padStart(3, '0'),
          question: question || '',
          answer: answer || '',
          textChunk
        });
      }
    }
    
    return faqItems;
  }
}
