"""
Text Vectorization Module

This module provides functionality to convert text chunks into vector embeddings
using sentence transformers.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TextVectorizer:
    """
    A class for vectorizing text chunks using sentence transformers.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the TextVectorizer with a specified sentence transformer model.
        
        Args:
            model_name (str): Name of the sentence transformer model to use.
        
        Raises:
            RuntimeError: If the model fails to load.
        """
        self.model_name = model_name
        self.model = None
        
        try:
            self.model = SentenceTransformer(model_name)
            logger.info(f"Successfully loaded model: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {str(e)}")
            raise RuntimeError(f"Failed to load sentence transformer model: {str(e)}")
    
    def vectorize_chunk(self, text_chunk: str) -> np.ndarray:
        """
        Convert a single text chunk into a vector embedding.
        
        Args:
            text_chunk (str): The text chunk to vectorize.
            
        Returns:
            np.ndarray: The vector embedding as a numpy array.
            
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
            
            logger.debug(f"Successfully vectorized text chunk")
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to vectorize text chunk: {str(e)}")
            raise RuntimeError(f"Vectorization failed: {str(e)}")



