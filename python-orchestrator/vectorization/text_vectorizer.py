"""
Text Vectorization Module

This module provides configurable functionality to convert text chunks into vector embeddings
using sentence transformers with configurable dimensions.
"""

import os
import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from typing import List, Union

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TextVectorizer:
    """
    A class for vectorizing text chunks using sentence transformers with configurable dimensions.
    """
    
    def __init__(self, model_name: str = None, vector_dimension: int = None):
        """
        Initialize the TextVectorizer with configurable model and dimensions.
        
        Args:
            model_name (str, optional): Name of the sentence transformer model to use.
                                       Defaults to env variable VECTOR_MODEL_NAME or 'all-MiniLM-L6-v2'.
            vector_dimension (int, optional): Target vector dimension.
                                             Defaults to env variable VECTOR_DIMENSION or 384.
        
        Raises:
            RuntimeError: If the model fails to load.
        """
        # Load configuration from environment or use defaults
        self.model_name = model_name or os.getenv('VECTOR_MODEL_NAME', 'all-MiniLM-L6-v2')
        self.target_dimension = vector_dimension or int(os.getenv('VECTOR_DIMENSION', '384'))
        
        self.model = None
        
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Successfully loaded model: {self.model_name}")
            logger.info(f"Target vector dimension: {self.target_dimension}")
            
            # Get actual model dimension
            self.actual_dimension = self.model.get_sentence_embedding_dimension()
            logger.info(f"Actual model dimension: {self.actual_dimension}")
            
            if self.actual_dimension != self.target_dimension:
                logger.warning(f"Model dimension ({self.actual_dimension}) differs from target ({self.target_dimension})")
                
        except Exception as e:
            logger.error(f"Failed to load model {self.model_name}: {str(e)}")
            raise RuntimeError(f"Failed to load sentence transformer model: {str(e)}")
    
    def vectorize_chunk(self, text_chunk: str) -> np.ndarray:
        """
        Convert a single text chunk into a vector embedding.
        
        Args:
            text_chunk (str): The text chunk to vectorize.
            
        Returns:
            np.ndarray: The vector embedding as a numpy array with target dimension.
            
        Raises:
            ValueError: If the text chunk is empty or invalid.
            RuntimeError: If vectorization fails.
        """
        if not text_chunk or not isinstance(text_chunk, str):
            raise ValueError("Text chunk must be a non-empty string")
        
        if not text_chunk.strip():
            raise ValueError("Text chunk cannot be empty or only whitespace")
        
        try:
            embedding = self.model.encode(text_chunk)
            if not isinstance(embedding, np.ndarray):
                embedding = np.array(embedding)
            
            # Resize vector to target dimension if needed
            if embedding.shape[0] != self.target_dimension:
                embedding = self._resize_vector(embedding, self.target_dimension)
            
            logger.debug(f"Successfully vectorized text chunk to dimension {embedding.shape[0]}")
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to vectorize text chunk: {str(e)}")
            raise RuntimeError(f"Vectorization failed: {str(e)}")
    
    def vectorize_chunks_batch(self, text_chunks: List[str]) -> List[np.ndarray]:
        """
        Convert multiple text chunks into vector embeddings in batch.
        
        Args:
            text_chunks (List[str]): List of text chunks to vectorize.
            
        Returns:
            List[np.ndarray]: List of vector embeddings as numpy arrays with target dimension.
            
        Raises:
            ValueError: If the input list is empty or contains invalid text chunks.
            RuntimeError: If vectorization fails.
        """
        if not text_chunks:
            raise ValueError("Text chunks list cannot be empty")
        
        if not isinstance(text_chunks, list):
            raise ValueError("Input must be a list of strings")
        
        # Validate each text chunk
        for i, chunk in enumerate(text_chunks):
            if not chunk or not isinstance(chunk, str):
                raise ValueError(f"Text chunk at index {i} must be a non-empty string")
            if not chunk.strip():
                raise ValueError(f"Text chunk at index {i} cannot be empty or only whitespace")
        
        try:
            # Encode all text chunks at once for better performance
            embeddings = self.model.encode(text_chunks)
            
            # Ensure embeddings are numpy arrays and resize if needed
            if not isinstance(embeddings, np.ndarray):
                embeddings = np.array(embeddings)
            
            result = []
            for i in range(len(text_chunks)):
                embedding = embeddings[i] if embeddings.ndim > 1 else embeddings
                if embedding.shape[0] != self.target_dimension:
                    embedding = self._resize_vector(embedding, self.target_dimension)
                result.append(embedding)
            
            logger.debug(f"Successfully vectorized {len(text_chunks)} text chunks in batch to dimension {self.target_dimension}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to vectorize text chunks in batch: {str(e)}")
            raise RuntimeError(f"Batch vectorization failed: {str(e)}")
    
    def _resize_vector(self, vector: np.ndarray, target_dim: int) -> np.ndarray:
        """
        Resize vector to target dimension using truncation or padding.
        
        Args:
            vector (np.ndarray): Original vector.
            target_dim (int): Target dimension.
            
        Returns:
            np.ndarray: Resized vector.
        """
        current_dim = vector.shape[0]
        
        if current_dim == target_dim:
            return vector
        
        if current_dim > target_dim:
            # Truncate
            logger.debug(f"Truncating vector from {current_dim} to {target_dim}")
            return vector[:target_dim]
        else:
            # Pad with zeros
            logger.debug(f"Padding vector from {current_dim} to {target_dim}")
            padded = np.zeros(target_dim)
            padded[:current_dim] = vector
            return padded
    
    def get_model_info(self) -> dict:
        """
        Get information about the current model and configuration.
        
        Returns:
            dict: Model information including name, dimensions, etc.
        """
        return {
            'model_name': self.model_name,
            'actual_dimension': self.actual_dimension,
            'target_dimension': self.target_dimension,
            'requires_resizing': self.actual_dimension != self.target_dimension
        }
