import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.agents.claims_agent import create_claim, delete_claim, update_claim_status
from .conftest_database import setup_test_policy

@pytest.fixture(scope="function")
def setup_test_claim(setup_test_policy):
    """Create a test claim and clean up after test."""
    # Get the actual policy ID from the fixture
    policy_id = setup_test_policy['policy_id']
    
    # Create test claim
    claim = create_claim(
        policy_id=policy_id,
        damage_description="Test damage description",
        vehicle="Test Vehicle 2023",
        photos=["test_photo1.jpg", "test_photo2.jpg"]
    )
    
    yield claim
    
    # Clean up test claim
    try:
        delete_claim(claim['claim_id'])
    except:
        # If claim doesn't exist or already deleted, ignore
        pass

@pytest.fixture(scope="function")
def setup_multiple_test_claims(setup_test_policy):
    """Create multiple test claims for testing list operations."""
    import os
    claims = []
    
    # Get the actual policy ID from the fixture
    policy_id = setup_test_policy['policy_id']
    
    # Create first test claim
    os.environ["TEST_CLAIM_COUNTER"] = "1"
    claim1 = create_claim(
        policy_id=policy_id,
        damage_description="First test damage",
        vehicle="Test Vehicle 1"
    )
    claims.append(claim1)
    
    # Create second test claim with different status
    os.environ["TEST_CLAIM_COUNTER"] = "2"
    claim2 = create_claim(
        policy_id=policy_id,
        damage_description="Second test damage",
        vehicle="Test Vehicle 2"
    )
    # Update second claim status
    update_claim_status(claim2['claim_id'], "In Review")
    claims.append(claim2)
    
    yield claims
    
    # Clean up all test claims
    for claim in claims:
        try:
            delete_claim(claim['claim_id'])
        except:
            pass
