from src.data_processing.text_vectorizer import TextVectorizer
from src.database.database_manager import db_manager
import numpy as np
from typing import List, Dict, Optional, Union


class KnowledgeAgent:
    """
    Knowledge Agent for RAG-based search functionality.
    Provides vector similarity search over the knowledge base.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the Knowledge Agent with a text vectorizer.
        
        Args:
            model_name (str): Name of the sentence transformer model to use.
        """
        self.vectorizer = TextVectorizer(model_name)
    
    def search_knowledge_base(
        self, 
        query: str, 
        limit: int = 5, 
        source_filter: Optional[str] = None
    ) -> List[Dict[str, Union[str, float, dict]]]:
        """
        Search the knowledge base for entries similar to the query.
        
        Args:
            query (str): The search query text.
            limit (int): Maximum number of results to return (default: 5).
            source_filter (Optional[str]): Filter by source_type (e.g., 'faq', 'policy_doc').
                                        If None, searches all sources.
        
        Returns:
            List[Dict]: List of knowledge base entries with similarity scores.
                        Each dict contains:
                        - doc_id: UUID of the document
                        - source_type: Type of source (faq, policy_doc, admin_note)
                        - text_chunk: The text content
                        - metadata: JSON metadata
                        - similarity_score: Cosine similarity (0-1, higher = more similar)
        
        Raises:
            ValueError: If query is empty or invalid.
            RuntimeError: If search fails.
        """
        # Validate input
        if not query or not isinstance(query, str):
            raise ValueError("Query must be a non-empty string")
        
        if not query.strip():
            raise ValueError("Query cannot be empty or only whitespace")
        
        if limit <= 0:
            raise ValueError("Limit must be greater than 0")
        
        if limit > 50:  # Reasonable upper bound
            raise ValueError("Limit cannot exceed 50")
        
        try:
            # Convert query to vector
            query_vector = self.vectorizer.vectorize_chunk(query)
            query_vector_list = query_vector.tolist()
            
            # Build SQL query with proper vector formatting
            sql = """
                SELECT 
                    doc_id, 
                    source_type, 
                    text_chunk, 
                    metadata, 
                    1 - (embedding <=> %s::vector) as similarity_score
                FROM knowledge_base
                WHERE (%s::text IS NULL OR source_type = %s)
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            
            # Execute query
            params = (query_vector_list, source_filter, source_filter, query_vector_list, limit)
            results = db_manager.execute_query_with_result(sql, params)
            
            # Format results
            formatted_results = []
            for row in results:
                formatted_results.append({
                    'doc_id': row['doc_id'],
                    'source_type': row['source_type'],
                    'text_chunk': row['text_chunk'],
                    'metadata': row['metadata'] if row['metadata'] else {},
                    'similarity_score': float(row['similarity_score'])
                })
            
            return formatted_results
            
        except Exception as e:
            raise RuntimeError(f"Knowledge base search failed: {str(e)}")


# Global instance for easy access
knowledge_agent = KnowledgeAgent()
