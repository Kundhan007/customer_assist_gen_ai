import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TextVectorizerService {
  private readonly VECTOR_DIMENSION = 384;

  /**
   * Generate a simple hash-based vector for text
   * This creates consistent pseudo-vectors for testing/demo purposes
   * For production, consider using TensorFlow.js Universal Sentence Encoder
   */
  async generateVector(text: string): Promise<number[]> {
    // Create a deterministic hash-based vector
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    const vector: number[] = [];
    
    // Convert hash to vector of the correct dimension
    for (let i = 0; i < this.VECTOR_DIMENSION; i++) {
      const chunkIndex = Math.floor(i / 8) * 8;
      const chunk = hash.substring(chunkIndex, chunkIndex + 8) || '00000000';
      const value = parseInt(chunk, 16);
      
      // Normalize to range [-1, 1]
      const normalizedValue = (value / 0xFFFFFFFF) * 2 - 1;
      vector.push(normalizedValue);
    }
    
    // Normalize the vector to unit length
    return this.normalizeVector(vector);
  }

  /**
   * Generate vectors for multiple text chunks in batch
   */
  async generateVectorsBatch(textChunks: string[]): Promise<number[][]> {
    const vectors: number[][] = [];
    
    for (const chunk of textChunks) {
      const vector = await this.generateVector(chunk);
      vectors.push(vector);
    }
    
    return vectors;
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    
    if (magnitude === 0) {
      return vector;
    }
    
    return vector.map(val => val / magnitude);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * (vectorB[i] || 0), 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Get vector dimension
   */
  getVectorDimension(): number {
    return this.VECTOR_DIMENSION;
  }
}
