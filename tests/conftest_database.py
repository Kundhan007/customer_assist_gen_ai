import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.database.database_manager import db_manager
from .conftest_common import (
    TEST_USER_ID, 
    TEST_ADMIN_USER_ID, 
    TEST_MULTI_USER_1, 
    TEST_MULTI_USER_2,
    TEST_USER_EMAIL, 
    TEST_ADMIN_EMAIL, 
    TEST_PASSWORD_HASH,
    TEST_CLAIM_ID, 
    TEST_CLAIM_ID_2, 
    TEST_POLICY_ID, 
    TEST_POLICY_ID_1, 
    TEST_POLICY_ID_2
)

@pytest.fixture(scope="function")
def setup_test_user():
    """Create a test user for policy testing."""
    # Ensure a clean state by deleting the test user if it already exists
    try:
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_USER_ID,))
    except Exception:
        # Ignore errors if the user doesn't exist or table is not yet created
        pass

    # Create test user
    sql = """INSERT INTO users (user_id, email, password_hash, role) 
             VALUES (%s, %s, %s, 'user')"""
    db_manager.execute_query(sql, (TEST_USER_ID, TEST_USER_EMAIL, TEST_PASSWORD_HASH))
    
    yield TEST_USER_ID
    
    # Clean up test user
    try:
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_USER_ID,))
    except Exception:
        # Ignore errors during cleanup, e.g., if already deleted
        pass

@pytest.fixture(scope="function")
def setup_test_admin_user():
    """Create a test admin user."""
    # Ensure a clean state by deleting the test admin user if it already exists
    try:
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_ADMIN_USER_ID,))
    except Exception:
        pass

    # Create test admin user
    sql = """INSERT INTO users (user_id, email, password_hash, role) 
             VALUES (%s, %s, %s, 'admin')"""
    db_manager.execute_query(sql, (TEST_ADMIN_USER_ID, TEST_ADMIN_EMAIL, TEST_PASSWORD_HASH))
    
    yield TEST_ADMIN_USER_ID
    
    # Clean up test admin user
    try:
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_ADMIN_USER_ID,))
    except Exception:
        pass

@pytest.fixture(scope="function")
def setup_test_user_with_policies():
    """Create a test user with associated policies."""
    user_id = TEST_USER_ID
    
    # Ensure a clean state
    try:
        db_manager.execute_query("DELETE FROM policies WHERE user_id = %s", (user_id,))
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (user_id,))
    except Exception:
        pass

    # Create test user
    sql = """INSERT INTO users (user_id, email, password_hash, role) 
             VALUES (%s, %s, %s, 'user')"""
    db_manager.execute_query(sql, (user_id, TEST_USER_EMAIL, TEST_PASSWORD_HASH))
    
    # Create test policies for the user
    policy1_sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
                     roadside_assistance, deductible, premium) 
                     VALUES (%s, %s, 'Silver', 30000, false, 1000, 350.00)"""
    db_manager.execute_query(policy1_sql, (TEST_POLICY_ID_1, user_id))
    
    policy2_sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
                     roadside_assistance, deductible, premium) 
                     VALUES (%s, %s, 'Gold', 50000, true, 500, 500.00)"""
    db_manager.execute_query(policy2_sql, (TEST_POLICY_ID_2, user_id))
    
    yield user_id
    
    # Clean up
    try:
        db_manager.execute_query("DELETE FROM policies WHERE user_id = %s", (user_id,))
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (user_id,))
    except Exception:
        pass

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
    
    # Clean up test users
    test_user_ids = [TEST_USER_ID, TEST_ADMIN_USER_ID, TEST_MULTI_USER_1, TEST_MULTI_USER_2]
    for user_id in test_user_ids:
        try:
            db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (user_id,))
        except:
            pass
