import os
import pytest
from src.agents.claims_agent import (
    create_claim, get_claim_by_id, get_claims_by_policy,
    update_claim_status, delete_claim, get_claim_statistics
)

# Set test mode environment variable
os.environ["TEST_MODE"] = "true"

class TestClaimsAgent:
    """Test suite for claims agent functions."""

    def test_create_claim_success(self, setup_test_policy):
        """Test successful claim creation."""
        os.environ["TEST_CLAIM_COUNTER"] = "1"
        
        # Get the actual policy ID from the fixture
        policy_id = setup_test_policy['policy_id']
        
        claim = create_claim(
            policy_id=policy_id,
            damage_description="Test damage description",
            vehicle="Test Vehicle 2023",
            photos=["test_photo1.jpg", "test_photo2.jpg"]
        )
        
        assert claim is not None
        assert claim['claim_id'] == "TEST-001"
        assert claim['policy_id'] == policy_id
        assert claim['status'] == "Submitted"
        assert claim['damage_description'] == "Test damage description"
        assert claim['vehicle'] == "Test Vehicle 2023"
        assert len(claim['photos']) == 2
        assert "test_photo1.jpg" in claim['photos']
        assert "test_photo2.jpg" in claim['photos']
        
        # Clean up
        delete_claim("TEST-001")

    def test_create_claim_invalid_policy(self):
        """Test claim creation with invalid policy ID."""
        with pytest.raises(ValueError, match="Policy INVALID-POL not found"):
            create_claim(
                policy_id="INVALID-POL",
                damage_description="Test damage",
                vehicle="Test Vehicle"
            )

    def test_create_claim_without_photos(self, setup_test_policy):
        """Test claim creation without photos."""
        os.environ["TEST_CLAIM_COUNTER"] = "1"
        
        # Get the actual policy ID from the fixture
        policy_id = setup_test_policy['policy_id']
        
        claim = create_claim(
            policy_id=policy_id,
            damage_description="Test damage without photos",
            vehicle="Test Vehicle 2023"
        )
        
        assert claim is not None
        assert claim['photos'] == []
        
        # Clean up
        delete_claim("TEST-001")

    def test_get_claim_by_id_success(self, setup_test_claim):
        """Test retrieving claim by ID."""
        claim = get_claim_by_id("TEST-001")
        
        assert claim is not None
        assert claim['claim_id'] == "TEST-001"
        # The policy_id should match whatever policy was created in the fixture
        assert claim['policy_id'] is not None

    def test_get_claim_by_id_not_found(self):
        """Test retrieving non-existent claim by ID."""
        claim = get_claim_by_id("NON-EXISTENT")
        assert claim is None

    def test_get_claims_by_policy_success(self, setup_test_claim):
        """Test retrieving claims by policy ID."""
        # Get the policy ID from the claim fixture
        policy_id = setup_test_claim['policy_id']
        
        claims = get_claims_by_policy(policy_id)
        
        assert len(claims) >= 1
        claim = next((c for c in claims if c['claim_id'] == "TEST-001"), None)
        assert claim is not None
        assert claim['policy_id'] == policy_id

    def test_get_claims_by_policy_no_claims(self, setup_test_policy):
        """Test retrieving claims for policy with no claims."""
        # Get the actual policy ID from the fixture
        policy_id = setup_test_policy['policy_id']
        
        claims = get_claims_by_policy(policy_id)
        assert len(claims) == 0

    def test_update_claim_status_valid_transition(self, setup_test_claim):
        """Test valid claim status transition."""
        claim_id = setup_test_claim['claim_id']
        updated_claim = update_claim_status(claim_id, "In Review")
        
        assert updated_claim is not None
        assert updated_claim['status'] == "In Review"
        
        # Clean up
        delete_claim(claim_id)

    def test_update_claim_status_invalid_transition(self, setup_test_claim):
        """Test invalid claim status transition."""
        claim_id = setup_test_claim['claim_id']
        # First close the claim
        update_claim_status(claim_id, "Closed")
        
        # Try to update from Closed to Submitted (should fail)
        with pytest.raises(ValueError, match="Cannot transition from Closed to Submitted"):
            update_claim_status(claim_id, "Submitted")
        
        # Clean up
        delete_claim(claim_id)

    def test_update_claim_status_nonexistent_claim(self):
        """Test updating status of non-existent claim."""
        with pytest.raises(ValueError, match="Claim NON-EXISTENT not found"):
            update_claim_status("NON-EXISTENT", "In Review")

    def test_get_claim_statistics_success(self, setup_multiple_test_claims):
        """Test getting claim statistics."""
        stats = get_claim_statistics()
        
        assert 'total_claims' in stats
        assert 'status_counts' in stats
        assert isinstance(stats['total_claims'], int)
        assert isinstance(stats['status_counts'], dict)
        assert stats['total_claims'] >= 2

    def test_get_claim_statistics_empty(self):
        """Test getting claim statistics when no claims exist."""
        stats = get_claim_statistics()
        
        assert stats['total_claims'] >= 0
        assert isinstance(stats['status_counts'], dict)

    def test_delete_claim_success(self, setup_test_claim):
        """Test successful claim deletion (soft delete)."""
        claim_id = setup_test_claim['claim_id']
        result = delete_claim(claim_id)
        
        assert result['success'] is True
        assert f"{claim_id} closed successfully" in result['message']
        
        # Verify claim is marked as closed
        claim = get_claim_by_id(claim_id)
        assert claim['status'] == "Closed"

    def test_delete_claim_nonexistent(self):
        """Test deleting non-existent claim."""
        with pytest.raises(ValueError, match="Claim NON-EXISTENT not found"):
            delete_claim("NON-EXISTENT")

    def test_claim_status_transitions_workflow(self, setup_test_claim):
        """Test complete claim status workflow."""
        claim_id = setup_test_claim['claim_id']
        # Start with Submitted
        claim = get_claim_by_id(claim_id)
        assert claim['status'] == "Submitted"
        
        # Transition to In Review
        claim = update_claim_status(claim_id, "In Review")
        assert claim['status'] == "In Review"
        
        # Transition to Approved
        claim = update_claim_status(claim_id, "Approved")
        assert claim['status'] == "Approved"
        
        # Transition to Closed
        result = delete_claim(claim_id)
        assert result['success'] is True
        
        # Verify final status
        claim = get_claim_by_id(claim_id)
        assert claim['status'] == "Closed"

    def test_multiple_claims_same_policy(self, setup_test_policy):
        """Test creating multiple claims for the same policy."""
        # Get the actual policy ID from the fixture
        policy_id = setup_test_policy['policy_id']
        
        os.environ["TEST_CLAIM_COUNTER"] = "1"
        claim1 = create_claim(policy_id, "First claim", "Vehicle 1")
        
        os.environ["TEST_CLAIM_COUNTER"] = "2"
        claim2 = create_claim(policy_id, "Second claim", "Vehicle 2")
        
        # Retrieve claims for policy
        claims = get_claims_by_policy(policy_id)
        assert len(claims) >= 2
        
        # Clean up
        delete_claim("TEST-001")
        delete_claim("TEST-002")

    @pytest.mark.claims
    def test_comprehensive_claim_lifecycle(self, setup_test_policy):
        """Test comprehensive claim lifecycle with all operations."""
        os.environ["TEST_CLAIM_COUNTER"] = "1"
        
        # Get the actual policy ID from the fixture
        policy_id = setup_test_policy['policy_id']
        
        # Create claim
        claim = create_claim(
            policy_id=policy_id,
            damage_description="Initial damage",
            vehicle="Test Vehicle"
        )
        assert claim['status'] == "Submitted"
        
        # Update status through workflow
        claim = update_claim_status("TEST-001", "In Review")
        assert claim['status'] == "In Review"
        
        claim = update_claim_status("TEST-001", "Approved")
        assert claim['status'] == "Approved"
        
        # Get statistics
        stats = get_claim_statistics()
        assert stats['total_claims'] >= 1
        
        # Delete claim
        result = delete_claim("TEST-001")
        assert result['success'] is True
        
        # Verify deletion
        claim = get_claim_by_id("TEST-001")
        assert claim['status'] == "Closed"
