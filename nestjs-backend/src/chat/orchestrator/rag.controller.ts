import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { RagVectorQueryDto } from './dto/rag-vector-query.dto';
import { RagResponseDto } from './dto/rag-result.dto';

@ApiTags('rag')
@Controller('orchestrator/rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);

  constructor(private readonly ragService: RagService) {}

  @Post('search')
  @ApiOperation({ summary: 'Search for similar content using RAG with cosine similarity' })
  @ApiResponse({ status: 200, description: 'RAG search completed successfully', type: RagResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchSimilarContent(@Body() queryDto: RagQueryDto): Promise<RagResponseDto> {
    try {
      this.logger.log(`RAG search request received: ${JSON.stringify(queryDto)}`);
      
      const results = await this.ragService.searchSimilarContent(
        queryDto.query,
        queryDto.limit
      );

      const response: RagResponseDto = {
        results,
        totalResults: results.length,
        query: queryDto.query
      };

      this.logger.log(`RAG search completed, found ${results.length} results`);
      return response;
    } catch (error) {
      this.logger.error('Error in RAG search:', error);
      throw new HttpException(
        'Failed to perform RAG search',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('search-vector')
  @ApiOperation({ summary: 'Search for similar content using pre-computed vector with cosine similarity' })
  @ApiResponse({ status: 200, description: 'Vector RAG search completed successfully', type: RagResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async searchSimilarContentByVector(@Body() vectorDto: RagVectorQueryDto): Promise<RagResponseDto> {
    try {
      this.logger.log(`Vector RAG search request received with vector length: ${vectorDto.vector.length}`);
      
      const results = await this.ragService.searchSimilarContentByVector(
        vectorDto.vector,
        vectorDto.limit
      );

      const response: RagResponseDto = {
        results,
        totalResults: results.length,
        query: vectorDto.query || 'Vector search'
      };

      this.logger.log(`Vector RAG search completed, found ${results.length} results`);
      return response;
    } catch (error) {
      this.logger.error('Error in vector RAG search:', error);
      throw new HttpException(
        'Failed to perform vector RAG search',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
