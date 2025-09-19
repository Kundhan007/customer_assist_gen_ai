import os
import pytest
import decimal
from src.agents.policy_agent import (
    create_policy, get_policy_by_id, get_policies_by_user,
    update_policy_details, cancel_policy, calculate_premium
)

# Set test mode environment variable
os.environ["TEST_MODE"] = "true"

class TestPolicyAgent:
    """Test suite for policy agent functions."""

    def test_create_policy_success(self, setup_test_user):
        """Test successful policy creation."""
        os.environ["TEST_POLICY_COUNTER"] = "1"
        
        policy = create_policy(
            user_id="11111111-1111-1111-1111-111111111111",
            plan_name="Silver",
            collision_coverage=200000,
            roadside_assistance=True,
            deductible=5000,
            premium=10000.00
        )
        
        assert policy is not None
        assert policy['policy_id'] == "POL-TEST-001"
        assert policy['user_id'] == "11111111-1111-1111-1111-111111111111"
        assert policy['plan_name'] == "Silver"
        assert policy['collision_coverage'] == 200000
        assert policy['roadside_assistance'] is True
        assert policy['deductible'] == 5000
        assert policy['premium'] == 10000.00
        
        # Clean up
        cancel_policy("POL-TEST-001")

    def test_create_policy_invalid_user(self):
        """Test policy creation with invalid user ID."""
        with pytest.raises(ValueError, match="Invalid user ID format"):
            create_policy(
                user_id="INVALID-USER",
                plan_name="Silver",
                collision_coverage=200000,
                roadside_assistance=False,
                deductible=5000,
                premium=8000.00
            )

    def test_create_policy_invalid_plan_name(self, setup_test_user):
        """Test policy creation with invalid plan name."""
        with pytest.raises(ValueError, match="Invalid plan name: InvalidPlan"):
            create_policy(
                user_id="11111111-1111-1111-1111-111111111111",
                plan_name="InvalidPlan",
                collision_coverage=200000,
                roadside_assistance=False,
                deductible=5000,
                premium=8000.00
            )

    def test_create_policy_premium_mismatch(self, setup_test_user):
        """Test policy creation with premium mismatch."""
        with pytest.raises(ValueError, match="Premium mismatch"):
            create_policy(
                user_id="11111111-1111-1111-1111-111111111111",
                plan_name="Silver",
                collision_coverage=200000,
                roadside_assistance=True,
                deductible=5000,
                premium=5000.00  # This doesn't match calculated premium
            )

    def test_get_policy_by_id_success(self, setup_test_policy):
        """Test retrieving policy by ID."""
        policy = get_policy_by_id("POL-TEST-001")
        
        assert policy is not None
        assert policy['policy_id'] == "POL-TEST-001"
        assert policy['plan_name'] == "Silver"

    def test_get_policy_by_id_not_found(self):
        """Test retrieving non-existent policy by ID."""
        policy = get_policy_by_id("NON-EXISTENT")
        assert policy is None

    def test_get_policies_by_user_success(self, setup_test_policy):
        """Test retrieving policies by user ID."""
        policies = get_policies_by_user("11111111-1111-1111-1111-111111111111")
        
        assert len(policies) >= 1
        policy = next((p for p in policies if p['policy_id'] == "POL-TEST-001"), None)
        assert policy is not None
        assert policy['user_id'] == "11111111-1111-1111-1111-111111111111"

    def test_get_policies_by_user_no_policies(self, setup_test_user):
        """Test retrieving policies for user with no policies."""
        policies = get_policies_by_user("11111111-1111-1111-1111-111111111111")
        assert len(policies) == 0

    def test_update_policy_details_success(self, setup_test_policy):
        """Test updating policy details."""
        policy_id = setup_test_policy['policy_id']
        updated_policy = update_policy_details(
            policy_id,
            plan_name="Gold",
            collision_coverage=300000,
            roadside_assistance=True,
            deductible=3000,
            premium=22499.80  # Use correct calculated premium
        )
        
        assert updated_policy is not None
        assert updated_policy['plan_name'] == "Gold"
        assert updated_policy['collision_coverage'] == 300000
        assert updated_policy['roadside_assistance'] is True
        assert updated_policy['deductible'] == 3000
        assert abs(float(updated_policy['premium']) - 22499.80) < 0.01
        
        # Clean up
        cancel_policy(policy_id)

    def test_update_policy_details_partial_update(self, setup_test_policy):
        """Test partial policy details update."""
        policy_id = setup_test_policy['policy_id']
        original_policy = get_policy_by_id(policy_id)
        
        # Update only plan name
        updated_policy = update_policy_details(
            policy_id,
            plan_name="Gold"
        )
        
        assert updated_policy is not None
        assert updated_policy['plan_name'] == "Gold"
        assert updated_policy['collision_coverage'] == original_policy['collision_coverage']  # Unchanged
        assert updated_policy['roadside_assistance'] == original_policy['roadside_assistance']  # Unchanged
        
        # Clean up
        cancel_policy(policy_id)

    def test_update_policy_details_nonexistent(self):
        """Test updating details of non-existent policy."""
        with pytest.raises(ValueError, match="Policy NON-EXISTENT not found"):
            update_policy_details("NON-EXISTENT", plan_name="Gold")

    def test_update_policy_details_premium_mismatch(self, setup_test_policy):
        """Test updating policy details with premium mismatch."""
        policy_id = setup_test_policy['policy_id']
        
        with pytest.raises(ValueError, match="Premium mismatch"):
            update_policy_details(
                policy_id,
                plan_name="Gold",
                collision_coverage=300000,
                premium=5000.00  # This doesn't match calculated premium
            )
        
        # Clean up
        cancel_policy(policy_id)

    def test_cancel_policy_success(self, setup_test_policy):
        """Test successful policy cancellation."""
        policy_id = setup_test_policy['policy_id']
        cancelled_policy = cancel_policy(policy_id)
        
        assert cancelled_policy is not None
        assert cancelled_policy['status'] == "deleted"

    def test_cancel_policy_nonexistent(self):
        """Test cancelling non-existent policy."""
        with pytest.raises(ValueError, match="Policy NON-EXISTENT not found"):
            cancel_policy("NON-EXISTENT")

    def test_multiple_policies_same_user(self, setup_test_user):
        """Test creating multiple policies for the same user."""
        os.environ["TEST_POLICY_COUNTER"] = "1"
        policy1 = create_policy(
            "11111111-1111-1111-1111-111111111111",
            "Silver", 200000, True, 5000, 10000.00
        )
        
        os.environ["TEST_POLICY_COUNTER"] = "2"
        policy2 = create_policy(
            "11111111-1111-1111-1111-111111111111",
            "Gold", 300000, True, 3000, 22499.80  # Use correct calculated premium
        )
        
        # Retrieve policies for user
        policies = get_policies_by_user("11111111-1111-1111-1111-111111111111")
        assert len(policies) >= 2
        
        # Clean up
        cancel_policy("POL-TEST-001")
        cancel_policy("POL-TEST-002")

    @pytest.mark.policies
    def test_comprehensive_policy_lifecycle(self, setup_test_user):
        """Test comprehensive policy lifecycle with all operations."""
        os.environ["TEST_POLICY_COUNTER"] = "1"
        
        # Create policy
        policy = create_policy(
            "11111111-1111-1111-1111-111111111111",
            "Silver", 200000, True, 5000, 10000.00
        )
        assert policy is not None
        
        # Update policy details
        policy = update_policy_details(
            "POL-TEST-001",
            plan_name="Gold",
            collision_coverage=300000,
            deductible=3000
        )
        assert policy['plan_name'] == "Gold"
        assert policy['collision_coverage'] == 300000
        assert policy['deductible'] == 3000
        
        # Cancel policy
        result = cancel_policy("POL-TEST-001")
        assert result is not None
        assert result['status'] == "deleted"

    def test_premium_calculation_silver(self):
        """Test premium calculation for Silver plan."""
        premium = calculate_premium("Silver", 200000, True, 5000)
        # Silver: 8000 * (200000/200000) - ((5000-5000)/10000) + 2000 = 8000 + 2000 = 10000
        assert abs(premium - 10000.00) < 0.01

    def test_premium_calculation_gold(self):
        """Test premium calculation for Gold plan."""
        premium = calculate_premium("Gold", 200000, True, 5000)
        # Gold: 15000 * (200000/200000) - ((5000-5000)/10000) + 0 = 15000 + 0 = 15000
        assert abs(premium - 15000.00) < 0.01

    def test_premium_calculation_high_coverage(self):
        """Test premium calculation with high coverage."""
        premium = calculate_premium("Gold", 400000, True, 3000)
        # Gold: 15000 * (400000/200000) - ((5000-3000)/10000) + 0 = 15000 * 2 - 0.2 = 29999.8
        assert abs(premium - 29999.80) < 0.01

    def test_premium_calculation_no_assistance(self):
        """Test premium calculation without roadside assistance."""
        premium = calculate_premium("Silver", 200000, False, 5000)
        # Silver: 8000 * (200000/200000) - ((5000-5000)/10000) + 0 = 8000 + 0 = 8000
        assert abs(premium - 8000.00) < 0.01
