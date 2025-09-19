import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from src.agents.policy_agent import create_policy, cancel_policy
from .conftest_common import TEST_USER_ID, TEST_POLICY_ID_1, TEST_POLICY_ID_2
from .conftest_database import setup_test_user

@pytest.fixture(scope="function")
def setup_test_policy_for_agent(setup_test_user):
    """Create a test policy for policy agent testing."""
    # Create test policy using policy agent
    import os
    os.environ["TEST_POLICY_COUNTER"] = "1"
    
    policy = create_policy(
        user_id=TEST_USER_ID,
        plan_name="Silver",
        collision_coverage=200000,
        roadside_assistance=True,
        deductible=5000,
        premium=10000.00
    )
    
    yield policy
    
    # Clean up test policy
    try:
        cancel_policy(TEST_POLICY_ID_1)
    except:
        pass

@pytest.fixture(scope="function")
def setup_test_policy(setup_test_user):
    """Create a test policy for policy agent testing."""
    # Create test policy using policy agent
    import os
    os.environ["TEST_POLICY_COUNTER"] = "1"
    
    policy = create_policy(
        user_id=TEST_USER_ID,
        plan_name="Silver",
        collision_coverage=200000,
        roadside_assistance=True,
        deductible=5000,
        premium=10000.00
    )
    
    yield policy
    
    # Clean up test policy
    try:
        cancel_policy(TEST_POLICY_ID_1)
    except:
        pass

@pytest.fixture(scope="function")
def setup_multiple_test_policies(setup_test_user):
    """Create multiple test policies for testing list operations."""
    import os
    policies = []
    
    # Create first test policy
    os.environ["TEST_POLICY_COUNTER"] = "1"
    policy1 = create_policy(
        user_id=TEST_USER_ID,
        plan_name="Silver",
        collision_coverage=200000,
        roadside_assistance=True,
        deductible=5000,
        premium=10000.00
    )
    policies.append(policy1)
    
    # Create second test policy with different status
    os.environ["TEST_POLICY_COUNTER"] = "2"
    policy2 = create_policy(
        user_id=TEST_USER_ID,
        plan_name="Gold",
        collision_coverage=300000,
        roadside_assistance=True,
        deductible=3000,
        premium=22499.80  # Use correct calculated premium
    )
    policies.append(policy2)
    
    yield policies
    
    # Clean up all test policies
    for policy_id in [TEST_POLICY_ID_1, TEST_POLICY_ID_2]:
        try:
            cancel_policy(policy_id)
        except:
            pass
