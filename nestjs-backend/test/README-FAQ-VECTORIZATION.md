# NestJS FAQ Processing and Vectorization System

## Overview

This document describes the complete NestJS-based FAQ processing and vectorization system that handles the entire flow from FAQ markdown files to vector embeddings stored in PostgreSQL with pgvector extension.

## System Architecture

```
faq.md → NestJS Parser → NestJS Vectorizer → PostgreSQL with pgvector
```

### Key Components

1. **FAQ Parser Service** (`src/common/vectorizer/faq-parser.service.ts`)
   - Parses markdown FAQ files in format "number. Question? Answer."
   - Extracts questions, answers, and creates text chunks for vectorization
   - Returns structured FAQ items

2. **Text Vectorizer Service** (`src/common/vectorizer/text-vectorizer.service.ts`)
   - Generates 384-dimensional vector embeddings using hash-based method
   - Provides deterministic, consistent vectors for the same text
   - Includes vector normalization and similarity calculation utilities

3. **Database Schema** (`test/test-schema.sql` and `src/database/seed/production-schema.sql`)
   - PostgreSQL with pgvector extension
   - Knowledge base table for storing text chunks and embeddings
   - Optimized indexes for fast similarity search

## File Structure

```
nestjs-backend/
├── test/                                      # Test Environment
│   ├── data/
│   │   └── knowledge_base/
│   │       └── faq.md                        # Test FAQ data
│   ├── test-schema.sql                       # Test DB schema
│   ├── test-seed-data.sql                    # Test seed data
│   ├── setup-faq-vectors.ts                  # FAQ vector processing for tests
│   └── setup-db.ts                           # Test DB orchestration
├── src/
│   ├── common/
│   │   └── vectorizer/
│   │       ├── text-vectorizer.service.ts    # Vector generation service
│   │       └── faq-parser.service.ts        # FAQ file parsing service
│   ├── database/
│   │   └── seed/
│   │       ├── data/
│   │       │   └── knowledge_base/
│   │       │       └── faq.md                # Production FAQ copy
│   │       ├── production-schema.sql         # Production DB schema
│   │       ├── production-seed-data.sql      # Production seed data
│   │       └── setup-production-vectors.ts   # Production FAQ processing
│   └── scripts/
│       ├── seed-database.ts                  # Production DB seeding
│       └── generate-vectors.ts              # Standalone vector utility
```

## Vector Generation Method

### Current Implementation: Hash-based Vectors

The system uses a deterministic hash-based approach for vector generation:

1. **SHA-256 Hashing**: Text content is hashed using SHA-256
2. **Vector Conversion**: Hash is converted to 384-dimensional vector
3. **Normalization**: Vectors are normalized to unit length
4. **Consistency**: Same text always produces the same vector

**Advantages:**
- Deterministic and reproducible
- Fast and lightweight
- No external ML dependencies
- Consistent across environments

**Limitations:**
- Not semantically meaningful (for demo/testing purposes)
- For production, consider TensorFlow.js Universal Sentence Encoder

### Vector Properties

- **Dimension**: 384
- **Type**: Float32 array
- **Range**: [-1, 1] (normalized)
- **Similarity Metric**: Cosine similarity
- **Storage**: PostgreSQL vector type

## Database Schema

### Knowledge Base Table

```sql
CREATE TABLE knowledge_base (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL, -- faq, policy_doc, admin_note
    text_chunk TEXT NOT NULL,
    embedding VECTOR(384), -- 384-dimensional vectors
    metadata JSONB, -- {question: "Gold plan benefits", version: "2024"}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexing

```sql
-- Vector similarity index
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Performance indexes
CREATE INDEX idx_knowledge_base_source_type ON knowledge_base(source_type);
```

## Setup and Usage

### Test Environment Setup

```bash
# Set up complete test database with FAQ vectors
npm run setup:test-db

# Or run individual steps:
npm run setup:faq-vectors:test  # Process FAQ vectors only
```

### Production Environment Setup

```bash
# Set up complete production database with FAQ vectors
npm run setup:prod-db

# Or run individual steps:
npm run setup:faq-vectors:prod  # Process FAQ vectors only
```

### Vector Testing and Debugging

```bash
# Run comprehensive vector tests
npm run generate-vectors

# Test specific components
npm run generate-vectors -- --faq      # Test FAQ parsing
npm run generate-vectors -- --batch    # Test batch generation
npm run generate-vectors -- --actual   # Test with actual FAQ file
```

### Database Statistics

```bash
# View production database statistics
npm run db:stats
```

## FAQ File Format

The system expects FAQ files in the following format:

```markdown
1. How is the Gold plan different from the Silver plan? The Gold plan offers higher coverage limits, additional benefits like roadside assistance, and a lower deductible compared to the Silver plan.
2. Am I eligible for the Gold plan if I am 60 years old? Yes, individuals aged 60 are eligible for the Gold plan, provided they meet other standard health and vehicle requirements.
3. What does the Gold plan cover? The Gold plan covers a wide range of incidents including collision, comprehensive damage, liability, medical payments, and also includes perks like roadside assistance and annual health checkups.
```

**Format Requirements:**
- Numbered list starting from 1
- Question ends with "?"
- Answer follows immediately after the question
- Each FAQ item on a separate line

## Vector Search Integration

### Similarity Search Query

```sql
SELECT 
  doc_id,
  text_chunk,
  metadata,
  1 - (embedding <=> query_vector) as similarity_score
FROM knowledge_base 
WHERE source_type = 'faq'
ORDER BY embedding <=> query_vector
LIMIT 5;
```

### NestJS Service Integration

```typescript
// In your chat service
async findRelevantFAQs(query: string): Promise<FAQItem[]> {
  const queryVector = await this.vectorizer.generateVector(query);
  
  return this.knowledgeBaseRepository
    .createQueryBuilder('kb')
    .orderBy('kb.embedding <=> :queryVector', 'ASC')
    .setParameter('queryVector', queryVector)
    .limit(5)
    .getMany();
}
```

## Sample Data

### Test Database Summary
- **Users**: 4 (2 regular, 1 admin, 1 additional user)
- **Policies**: 4 (2 Gold, 2 Silver)
- **Claims**: 5 (various statuses)
- **Premium History**: 5 records
- **Knowledge Base**: 20 FAQ entries with vector embeddings

### Production Database Summary
- **Users**: 6 (4 regular users, 1 admin, 1 demo user)
- **Policies**: 5 (3 Gold, 2 Silver)
- **Claims**: 7 (various statuses including real-world scenarios)
- **Premium History**: 7 records
- **Knowledge Base**: 20 FAQ entries with vector embeddings

## Sample Credentials

### Test Environment
- **Admin**: admin@example.com / password
- **User**: testuser@example.com / password

### Production Environment
- **Admin**: demo.admin@example.com / password
- **User**: demo.user@example.com / password
- **User**: sarah.johnson@example.com / password

## API Integration Points

### Admin Endpoints
- `POST /admin/kb` - Upload FAQ file, auto-process and vectorize
- `GET /admin/kb` - List knowledge base entries
- `DELETE /admin/kb/:id` - Delete entries

### Chat Service
- Uses vector similarity search to find relevant FAQ answers
- Integrates with existing chat endpoints
- Provides context-aware responses

## Production Considerations

### Scaling
- Current hash-based vectors are suitable for demo/testing
- For production semantic search, consider:
  - TensorFlow.js Universal Sentence Encoder
  - OpenAI embeddings API
  - Other ML vector services

### Performance
- Vector indexes optimized for similarity search
- Batch processing for large FAQ files
- Connection pooling for database operations

### Security
- FAQ file validation and sanitization
- Database connection security
- Vector storage encryption considerations

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials in connection strings
   - Verify pgvector extension is installed

2. **Vector Generation Failures**
   - Check FAQ file format compliance
   - Verify text encoding (UTF-8)
   - Run vector tests: `npm run generate-vectors`

3. **Similarity Search Issues**
   - Verify vector dimensions match (384)
   - Check vector normalization
   - Test with sample queries

### Debug Commands

```bash
# Test vector generation
npm run generate-vectors

# Check database setup
npm run db:stats

# Re-process FAQ vectors
npm run setup:faq-vectors:test
npm run setup:faq-vectors:prod
```

## Future Enhancements

1. **Semantic Vectors**: Replace hash-based with TensorFlow.js embeddings
2. **Multi-language Support**: Extend parser for different languages
3. **Real-time Updates**: WebSocket-based FAQ updates
4. **Analytics**: Vector usage statistics and performance metrics
5. **Caching**: Redis caching for frequent queries

## Conclusion

This NestJS-based FAQ processing and vectorization system provides a complete, self-contained solution for handling FAQ content from markdown files to searchable vector embeddings. The system is designed to be simple, maintainable, and easily extensible for production use.
