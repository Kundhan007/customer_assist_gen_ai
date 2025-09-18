import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.database.database_manager import db_manager
from .conftest_common import TEST_USER_ID, TEST_CLAIM_ID, TEST_CLAIM_ID_2, TEST_POLICY_ID, TEST_POLICY_ID_1, TEST_POLICY_ID_2

@pytest.fixture(scope="function")
def setup_test_user():
    """Create a test user for policy testing."""
    # Create test user
    sql = """INSERT INTO users (user_id, email, password_hash, role) 
             VALUES (%s, 'test@example.com', 'hashed_password_123', 'user')"""
    db_manager.execute_query(sql, (TEST_USER_ID,))
    
    yield TEST_USER_ID
    
    # Clean up test user
    db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_USER_ID,))

@pytest.fixture(scope="function")
def setup_test_policy(setup_test_user):
    """Create a test policy for claim testing."""
    # Create test policy
    sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
             roadside_assistance, deductible, premium) 
             VALUES (%s, %s, 'Test Plan', 25000, false, 500, 200.00)"""
    db_manager.execute_query(sql, (TEST_POLICY_ID, TEST_USER_ID))
    
    yield TEST_POLICY_ID
    
    # Clean up test policy
    db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (TEST_POLICY_ID,))

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
    
    # Clean up test policies
    test_policy_ids = [TEST_POLICY_ID, TEST_POLICY_ID_1, TEST_POLICY_ID_2]
    for policy_id in test_policy_ids:
        try:
            db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (policy_id,))
        except:
            pass
    
    # Clean up test user
    try:
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_USER_ID,))
    except:
        pass
