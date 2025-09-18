import pytest
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Test constants
TEST_CLAIM_ID = "TEST-001"
TEST_CLAIM_ID_2 = "TEST-002"
TEST_POLICY_ID = "POL-TEST"
TEST_USER_ID = "11111111-1111-1111-1111-111111111111"
TEST_POLICY_ID_1 = "POL-TEST-001"
TEST_POLICY_ID_2 = "POL-TEST-002"

def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "claims: marks tests as claims agent tests"
    )
    config.addinivalue_line(
        "markers", "policies: marks tests as policies agent tests"
    )

def pytest_collection_modifyitems(config, items):
    """Add custom markers to test items."""
    for item in items:
        if "test_claims_agent.py" in str(item.fspath):
            item.add_marker(pytest.mark.claims)
        elif "test_policy_agent.py" in str(item.fspath):
            item.add_marker(pytest.mark.policies)
