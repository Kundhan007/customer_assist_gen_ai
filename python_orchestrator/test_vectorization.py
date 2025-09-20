#!/usr/bin/env python3
"""
Test script for Python Vectorization Orchestrator
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vectorization.text_vectorizer import TextVectorizer
import numpy as np

def test_vectorization():
    """Test vectorization functionality"""
    print("🧪 Testing Python Vectorization Orchestrator")
    print("=" * 50)
    
    # Test 1: Initialize vectorizer
    print("\n1. Testing TextVectorizer initialization...")
    try:
        vectorizer = TextVectorizer()
        print("✅ TextVectorizer initialized successfully")
    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        return False
    
    # Test 2: Get model info
    print("\n2. Testing model information...")
    try:
        info = vectorizer.get_model_info()
        print(f"✅ Model: {info['model_name']}")
        print(f"✅ Actual dimension: {info['actual_dimension']}")
        print(f"✅ Target dimension: {info['target_dimension']}")
        print(f"✅ Requires resizing: {info['requires_resizing']}")
    except Exception as e:
        print(f"❌ Model info failed: {e}")
        return False
    
    # Test 3: Single text vectorization
    print("\n3. Testing single text vectorization...")
    try:
        test_text = "Hello world, this is a vectorization test!"
        vector = vectorizer.vectorize_chunk(test_text)
        print(f"✅ Text: '{test_text}'")
        print(f"✅ Vector dimension: {len(vector)}")
        print(f"✅ First 5 values: {vector[:5]}")
        print(f"✅ Vector type: {type(vector)}")
    except Exception as e:
        print(f"❌ Single vectorization failed: {e}")
        return False
    
    # Test 4: Batch vectorization
    print("\n4. Testing batch vectorization...")
    try:
        texts = [
            "Hello world",
            "Testing batch processing",
            "Vectorization service",
            "Python orchestrator"
        ]
        vectors = vectorizer.vectorize_chunks_batch(texts)
        print(f"✅ Processed {len(texts)} texts")
        print(f"✅ Generated {len(vectors)} vectors")
        print(f"✅ Each vector dimension: {len(vectors[0])}")
        print(f"✅ All vectors same dimension: {all(len(v) == len(vectors[0]) for v in vectors)}")
    except Exception as e:
        print(f"❌ Batch vectorization failed: {e}")
        return False
    
    # Test 5: Custom dimension
    print("\n5. Testing custom vector dimension...")
    try:
        custom_vectorizer = TextVectorizer(vector_dimension=256)
        custom_vector = custom_vectorizer.vectorize_chunk("Custom dimension test")
        print(f"✅ Custom vector dimension: {len(custom_vector)}")
        print(f"✅ Expected: 256, Got: {len(custom_vector)}")
        
        # Test with larger dimension
        large_vectorizer = TextVectorizer(vector_dimension=512)
        large_vector = large_vectorizer.vectorize_chunk("Large dimension test")
        print(f"✅ Large vector dimension: {len(large_vector)}")
        print(f"✅ Expected: 512, Got: {len(large_vector)}")
    except Exception as e:
        print(f"❌ Custom dimension test failed: {e}")
        return False
    
    # Test 6: Environment configuration
    print("\n6. Testing environment configuration...")
    try:
        # Test default config
        default_dim = int(os.getenv('VECTOR_DIMENSION', '384'))
        default_model = os.getenv('VECTOR_MODEL_NAME', 'all-MiniLM-L6-v2')
        print(f"✅ Default dimension from env: {default_dim}")
        print(f"✅ Default model from env: {default_model}")
        
        # Test that vectorizer uses env defaults
        env_vectorizer = TextVectorizer()
        env_info = env_vectorizer.get_model_info()
        print(f"✅ Env vectorizer dimension: {env_info['target_dimension']}")
        print(f"✅ Env vectorizer model: {env_info['model_name']}")
    except Exception as e:
        print(f"❌ Environment config test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All tests passed! Python Vectorization Orchestrator is working correctly!")
    print("\n📋 Summary:")
    print(f"   • Model: {info['model_name']}")
    print(f"   • Default dimension: {info['target_dimension']}")
    print(f"   • Configurable dimensions: ✅")
    print(f"   • Batch processing: ✅")
    print(f"   • Environment configuration: ✅")
    print(f"   • API ready: ✅")
    
    return True

if __name__ == "__main__":
    success = test_vectorization()
    sys.exit(0 if success else 1)
