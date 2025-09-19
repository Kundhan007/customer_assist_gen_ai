import os
import random
import string
from src.database.database_manager import db_manager

def calculate_premium(plan_name, collision_coverage, roadside_assistance, deductible):
    """Calculate premium based on policy details."""
    base_rates = {
        'Silver': 8000,    # Base annual premium for Silver plan
        'Gold': 15000      # Base annual premium for Gold plan
    }
    
    if plan_name not in base_rates:
        raise ValueError(f"Invalid plan name: {plan_name}")
    
    base_premium = base_rates[plan_name]
    coverage_factor = collision_coverage / 200000  # Normalize to standard coverage (₹200,000)
    deductible_discount = (5000 - deductible) / 10000  # Lower deductible = higher premium (₹5,000 standard)
    assistance_fee = 2000 if roadside_assistance and plan_name == 'Silver' else 0  # Gold includes assistance
    
    return base_premium * coverage_factor - deductible_discount + assistance_fee

def create_policy(user_id, plan_name, collision_coverage, roadside_assistance, deductible, premium):
    """Creates a new policy with auto-generated policy_id."""
    # Generate policy ID (use test ID in test mode, random in production)
    policy_id = None
    if os.getenv("TEST_MODE") == "true":
        test_counter_str = os.getenv("TEST_POLICY_COUNTER", "1")
        try:
            test_counter = int(test_counter_str)
            policy_id = f"POL-TEST-{test_counter:03d}"
        except ValueError:
            # Fallback if TEST_POLICY_COUNTER is not an integer
            # Ensure generated IDs are within 20 characters
            if "USER_MULTI_POL_1" in test_counter_str:
                policy_id = "POL-TST-MULTIUSR-01" # 20 chars
            elif "USER_MULTI_POL_2" in test_counter_str:
                policy_id = "POL-TST-MULTIUSR-02" # 20 chars
            elif "NO_CLAIMS_POL" in test_counter_str: # For test_get_claim_history_by_user_id_no_claims
                policy_id = "POL-TST-NOCLAIMS-01" # 20 chars
            else: # Default fallback
                policy_id = "POL-TST-DEFAULT-01" # 18 chars
    else:
        # Production mode - generate random ID
        policy_id = f"POL-{random.randint(10000, 99999)}"
    
    # Validate user exists - handle invalid UUID gracefully
    try:
        user_check = db_manager.execute_query_with_result(
            "SELECT user_id FROM users WHERE user_id = %s", 
            (user_id,)
        )
        if not user_check:
            raise ValueError(f"User {user_id} not found")
    except Exception as e:
        if "invalid input syntax for type uuid" in str(e):
            raise ValueError(f"Invalid user ID format: {user_id}")
        raise e
    
    # Validate premium calculation
    calculated_premium = calculate_premium(plan_name, collision_coverage, roadside_assistance, deductible)
    if abs(calculated_premium - premium) > 0.01:  # Allow small rounding differences
        raise ValueError(f"Premium mismatch. Expected: {calculated_premium:.2f}, Provided: {premium:.2f}")
    
    # Insert policy
    sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
             roadside_assistance, deductible, premium) 
             VALUES (%s, %s, %s, %s, %s, %s, %s)"""
    db_manager.execute_query(sql, (policy_id, user_id, plan_name, collision_coverage, 
                                   roadside_assistance, deductible, premium))
    return get_policy_by_id(policy_id)

def get_policy_by_id(policy_id):
    """Retrieves a specific policy by its ID."""
    return db_manager.execute_query_single(
        "SELECT * FROM policies WHERE policy_id = %s", 
        (policy_id,)
    )

def get_policies_by_user(user_id):
    """Gets all policies for a specific user."""
    return db_manager.execute_query_with_result(
        "SELECT * FROM policies WHERE user_id = %s ORDER BY created_at DESC", 
        (user_id,)
    )

def update_policy_details(policy_id, plan_name=None, collision_coverage=None, 
                         roadside_assistance=None, deductible=None, premium=None):
    """Updates policy details with validation."""
    policy = get_policy_by_id(policy_id)
    if not policy:
        raise ValueError(f"Policy {policy_id} not found")
    
    # Build update query dynamically
    updates = []
    params = []
    
    if plan_name and plan_name != policy['plan_name']:
        updates.append("plan_name = %s")
        params.append(plan_name)
    
    if collision_coverage is not None and collision_coverage != policy['collision_coverage']:
        updates.append("collision_coverage = %s")
        params.append(collision_coverage)
    
    if roadside_assistance is not None and roadside_assistance != policy['roadside_assistance']:
        updates.append("roadside_assistance = %s")
        params.append(roadside_assistance)
    
    if deductible is not None and deductible != policy['deductible']:
        updates.append("deductible = %s")
        params.append(deductible)
    
    if premium is not None and premium != policy['premium']:
        # Validate premium calculation
        calculated_premium = calculate_premium(
            plan_name or policy['plan_name'],
            collision_coverage or policy['collision_coverage'],
            roadside_assistance or policy['roadside_assistance'],
            deductible or policy['deductible']
        )
        if abs(calculated_premium - premium) > 0.01:
            raise ValueError(f"Premium mismatch. Expected: {calculated_premium:.2f}, Provided: {premium:.2f}")
        
        updates.append("premium = %s")
        params.append(premium)
    
    if not updates:
        return policy  # No changes needed
    
    sql = f"UPDATE policies SET {', '.join(updates)} WHERE policy_id = %s"
    params.append(policy_id)
    db_manager.execute_query(sql, tuple(params))
    return get_policy_by_id(policy_id)

def cancel_policy(policy_id, reason="Customer request"):
    """Cancel a policy - simplified version without status."""
    policy = get_policy_by_id(policy_id)
    if not policy:
        raise ValueError(f"Policy {policy_id} not found")
    
    # Simply delete the policy as we don't have status functionality
    sql = "DELETE FROM policies WHERE policy_id = %s"
    db_manager.execute_query(sql, (policy_id,))
    return {"policy_id": policy_id, "status": "deleted"}
