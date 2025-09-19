import os
import pytest
from src.agents.claim_history_agent import (
    get_claim_history_by_user_id,
    get_detailed_claim_history
)
from src.agents.claims_agent import create_claim, delete_claim
from src.agents.policy_agent import create_policy, cancel_policy
from src.tests.conftest_common import TEST_USER_ID, TEST_POLICY_ID_1

# Set test mode environment variable
os.environ["TEST_MODE"] = "true"

class TestClaimHistoryAgent:
    """Test suite for claim history agent functions."""

    def test_get_claim_history_by_user_id_success(self, setup_test_claim):
        """Test successful retrieval of claim history by user ID."""
        user_id = TEST_USER_ID
        claim_id = setup_test_claim['claim_id']
        policy_id = setup_test_claim['policy_id']

        history = get_claim_history_by_user_id(user_id)

        assert isinstance(history, list)
        assert len(history) >= 1
        # Find the specific claim we created in the fixture
        claim_in_history = next((c for c in history if c['claim_id'] == claim_id), None)
        assert claim_in_history is not None
        assert claim_in_history['policy_id'] == policy_id

    def test_get_claim_history_by_user_id_no_claims(self, setup_test_user):
        """Test retrieving claim history for a user with policies but no claims."""
        user_id = setup_test_user
        
        # Create a policy for this user without any claims
        os.environ["TEST_POLICY_COUNTER"] = "NO_CLAIMS_POL"
        # We need to manually insert a policy to avoid issues with TEST_POLICY_ID_1 being used by other fixtures
        # or create a new unique policy ID for this test.
        temp_policy_id = "POL-NO-CLAIMS-01"
        from src.database.database_manager import db_manager
        db_manager.execute_query(
            """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
               roadside_assistance, deductible, premium) 
               VALUES (%s, %s, 'Silver', 30000, false, 1000, 350.00)""",
            (temp_policy_id, user_id)
        )

        history = get_claim_history_by_user_id(user_id)
        assert isinstance(history, list)
        assert len(history) == 0
        
        # Clean up the temporary policy
        db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (temp_policy_id,))


    def test_get_claim_history_by_user_id_invalid_user(self):
        """Test retrieving claim history with an invalid user ID."""
        invalid_user_id = "00000000-0000-0000-0000-000000000000"
        with pytest.raises(ValueError, match=f"User {invalid_user_id} not found"):
            get_claim_history_by_user_id(invalid_user_id)

    def test_get_detailed_claim_history_success(self, setup_test_claim):
        """Test successful retrieval of detailed claim history by claim ID."""
        claim_id = setup_test_claim['claim_id']
        policy_id = setup_test_claim['policy_id']

        details = get_detailed_claim_history(claim_id)

        assert details is not None
        assert details['claim_id'] == claim_id
        assert details['policy_id'] == policy_id
        assert 'status' in details
        assert 'damage_description' in details
        assert 'vehicle' in details
        assert 'last_updated' in details

    def test_get_detailed_claim_history_not_found(self):
        """Test retrieving detailed claim history for a non-existent claim ID."""
        details = get_detailed_claim_history("NON-EXISTENT-CLAIM-ID")
        assert details is None # The function should return None if not found

    def test_get_claim_history_by_user_id_multiple_policies_claims(self, setup_test_user):
        """Test retrieving claim history for a user with multiple policies and claims."""
        user_id = setup_test_user
        
        # Create first policy and claim
        os.environ["TEST_POLICY_COUNTER"] = "USER_MULTI_POL_1"
        policy1_id = TEST_POLICY_ID_1 # Assuming this gets correctly generated
        policy1 = create_policy(
            user_id=user_id, plan_name="Silver", collision_coverage=200000,
            roadside_assistance=True, deductible=5000, premium=10000.00
        )
        policy1_id_actual = policy1['policy_id'] # Use the actual generated ID

        os.environ["TEST_CLAIM_COUNTER"] = "USER_MULTI_CLAIM_1"
        claim1 = create_claim(
            policy_id=policy1_id_actual,
            damage_description="Claim on policy 1",
            vehicle="Vehicle X"
        )

        # Create second policy and claim
        os.environ["TEST_POLICY_COUNTER"] = "USER_MULTI_POL_2"
        policy2_id = "POL-TEST-002" # Assuming this gets correctly generated
        policy2 = create_policy(
            user_id=user_id, plan_name="Gold", collision_coverage=300000,
            roadside_assistance=True, deductible=3000, premium=22499.80
        )
        policy2_id_actual = policy2['policy_id'] # Use the actual generated ID

        os.environ["TEST_CLAIM_COUNTER"] = "USER_MULTI_CLAIM_2"
        claim2 = create_claim(
            policy_id=policy2_id_actual,
            damage_description="Claim on policy 2",
            vehicle="Vehicle Y"
        )

        history = get_claim_history_by_user_id(user_id)

        assert isinstance(history, list)
        assert len(history) >= 2
        
        claim_ids_in_history = [c['claim_id'] for c in history]
        assert claim1['claim_id'] in claim_ids_in_history
        assert claim2['claim_id'] in claim_ids_in_history

        # Clean up
        delete_claim(claim1['claim_id'])
        delete_claim(claim2['claim_id'])
        cancel_policy(policy1_id_actual)
        cancel_policy(policy2_id_actual)

# Add custom marker for claim history tests
def pytest_configure(config):
    """Configure pytest with custom markers."""
    # This function might be called multiple times, so check if marker already exists
    # to avoid warnings. For simplicity in a single file, direct addition is often fine.
    try:
        config.addinivalue_line(
            "markers", "claim_history: marks tests as claim history agent tests"
        )
    except ValueError:
        # Marker already exists (e.g., if conftest_common.py also adds it or it's added multiple times)
        pass

def pytest_collection_modifyitems(config, items):
    """Add custom markers to test items."""
    for item in items:
        if "test_claim_history_agent.py" in str(item.fspath):
            item.add_marker(pytest.mark.claim_history)
