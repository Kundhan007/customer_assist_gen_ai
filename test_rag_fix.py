#!/usr/bin/env python3
"""
Test script to verify RAG is working after fixing the similarity threshold.
"""

import asyncio
import sys
from python_orchestrator.orchestrator.tools import search_knowledge_base_tool
from python_orchestrator.utils.logger import get_logger

logger = get_logger(__name__)

async def test_rag_functionality():
    """Test RAG functionality with various queries."""
    print("Testing RAG functionality with improved similarity threshold\n")
    print("=" * 60)
    
    test_queries = [
        "Gold plan eligibility criteria",
        "How do I submit a claim?",
        "What is the deductible for Gold plan?",
        "Silver plan benefits",
        "Claim processing time"
    ]
    
    for query in test_queries:
        print(f"\n🔍 Testing query: '{query}'")
        
        try:
            # Test with different similarity thresholds
            for threshold in [0.3, 0.5, 0.7]:
                result = await search_knowledge_base_tool.arun(
                    query=query,
                    similarity_threshold=threshold,
                    limit=3
                )
                
                if isinstance(result, dict) and 'results' in result:
                    results_count = len(result['results'])
                    print(f"   Threshold {threshold}: Found {results_count} results")
                    
                    if results_count > 0:
                        print(f"   ✅ Top result: {result['results'][0].get('text_chunk', '')[:100]}...")
                        break
                else:
                    print(f"   Threshold {threshold}: Error - {result}")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("RAG testing completed!")

async def main():
    """Main test function."""
    try:
        await test_rag_functionality()
        print("\n🎉 RAG fix verification completed!")
        return True
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
