import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from agents.claims_agent import create_claim, delete_claim, get_claim_by_id
from src.database.database_manager import db_manager

# Test constants
TEST_CLAIM_ID = "TEST-001"
TEST_CLAIM_ID_2 = "TEST-002"
TEST_POLICY_ID = "POL-TEST"
TEST_USER_ID = "11111111-1111-1111-1111-111111111111"

@pytest.fixture(scope="function")
def setup_test_policy():
    """Create a test policy for claim testing."""
    # Create test policy
    sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
             roadside_assistance, deductible, premium) 
             VALUES (%s, %s, 'Test Plan', 25000, false, 500, 200.00)"""
    db_manager.execute_query(sql, (TEST_POLICY_ID, TEST_USER_ID))
    
    yield TEST_POLICY_ID
    
    # Clean up test policy
    db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (TEST_POLICY_ID,))

@pytest.fixture(scope="function")
def setup_test_claim(setup_test_policy):
    """Create a test claim and clean up after test."""
    # Create test claim
    claim = create_claim(
        policy_id=TEST_POLICY_ID,
        damage_description="Test damage description",
        vehicle="Test Vehicle 2023",
        photos=["test_photo1.jpg", "test_photo2.jpg"]
    )
    
    yield claim
    
    # Clean up test claim
    try:
        delete_claim(TEST_CLAIM_ID)
    except:
        # If claim doesn't exist or already deleted, ignore
        pass

@pytest.fixture(scope="function")
def setup_multiple_test_claims(setup_test_policy):
    """Create multiple test claims for testing list operations."""
    import os
    claims = []
    
    # Create first test claim
    os.environ["TEST_CLAIM_COUNTER"] = "1"
    claim1 = create_claim(
        policy_id=TEST_POLICY_ID,
        damage_description="First test damage",
        vehicle="Test Vehicle 1"
    )
    claims.append(claim1)
    
    # Create second test claim with different status
    os.environ["TEST_CLAIM_COUNTER"] = "2"
    claim2 = create_claim(
        policy_id=TEST_POLICY_ID,
        damage_description="Second test damage",
        vehicle="Test Vehicle 2"
    )
    # Update second claim status
    from agents.claims_agent import update_claim_status
    update_claim_status(TEST_CLAIM_ID_2, "In Review")
    claims.append(claim2)
    
    yield claims
    
    # Clean up all test claims
    for claim_id in [TEST_CLAIM_ID, TEST_CLAIM_ID_2]:
        try:
            delete_claim(claim_id)
        except:
            pass

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Clean up any remaining test data after all tests."""
    yield
    
    # Clean up any remaining test claims
    test_claim_ids = [TEST_CLAIM_ID, TEST_CLAIM_ID_2]
    for claim_id in test_claim_ids:
        try:
            db_manager.execute_query("DELETE FROM claims WHERE claim_id = %s", (claim_id,))
        except:
            pass
    
    # Clean up test policy
    try:
        db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (TEST_POLICY_ID,))
    except:
        pass

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "claims: marks tests as claims agent tests"
    )

def pytest_collection_modifyitems(config, items):
    """Add custom markers to test items."""
    for item in items:
        if "test_claims_agent.py" in str(item.fspath):
            item.add_marker(pytest.mark.claims)
