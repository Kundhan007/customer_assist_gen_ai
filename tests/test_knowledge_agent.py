import pytest
from src.agents.knowledge_agent import knowledge_agent

class TestKnowledgeAgent:
    """Simple test suite for knowledge agent using existing FAQ data."""

    def test_search_gold_plan_coverage(self):
        """Test search for Gold plan coverage information."""
        results = knowledge_agent.search_knowledge_base("Gold")
        
        # Should find at least one relevant result
        assert len(results) > 0
        
        # Find the result about Gold plan coverage
        gold_plan_result = None
        for result in results:
            if "Gold plan" in result['text_chunk']:
                gold_plan_result = result
                break
        
        # Verify we found the expected answer
        assert gold_plan_result is not None
        assert "collision" in gold_plan_result['text_chunk']
        assert "roadside assistance" in gold_plan_result['text_chunk']
        assert gold_plan_result['source_type'] == 'faq'
        assert gold_plan_result['similarity_score'] > 0.1

    def test_search_claim_status_check(self):
        """Test search for claim status checking information."""
        results = knowledge_agent.search_knowledge_base("claim")
        
        # Should find at least one relevant result
        assert len(results) > 0
        
        # Find the result about claim status
        claim_status_result = None
        for result in results:
            if "claim" in result['text_chunk']:
                claim_status_result = result
                break
        
        # Verify we found the expected answer
        assert claim_status_result is not None
        assert "claim" in claim_status_result['text_chunk']
        assert claim_status_result['source_type'] == 'faq'
        assert claim_status_result['similarity_score'] > 0.1

    def test_search_premium_payment_frequency(self):
        """Test search for premium payment frequency information."""
        results = knowledge_agent.search_knowledge_base("premium")
        
        # Should find at least one relevant result
        assert len(results) > 0
        
        # Find the result about premium payment
        premium_result = None
        for result in results:
            if "premium" in result['text_chunk']:
                premium_result = result
                break
        
        # Verify we found the expected answer
        assert premium_result is not None
        assert "premium" in premium_result['text_chunk']
        assert "Gold plan" in premium_result['text_chunk']
        assert premium_result['source_type'] == 'faq'
        assert premium_result['similarity_score'] > 0.1

    def test_search_no_results(self):
        """Test search with no matching results."""
        results = knowledge_agent.search_knowledge_base("xyz abc 123 nonexistent random words")
        assert len(results) == 0

    def test_search_empty_query(self):
        """Test search with empty query raises error."""
        with pytest.raises(ValueError, match="Query must be a non-empty string"):
            knowledge_agent.search_knowledge_base("")
