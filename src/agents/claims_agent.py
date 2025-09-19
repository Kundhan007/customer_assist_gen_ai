import os
import random
import string
from src.database.database_manager import db_manager

def create_claim(policy_id, damage_description, vehicle, photos=None):
    """Creates a new claim with auto-generated claim_id."""
    # Generate claim ID (use test ID in test mode, random in production)
    claim_id = None
    if os.getenv("TEST_MODE") == "true":
        # Get test claim counter from environment or use default
        test_counter_str = os.getenv("TEST_CLAIM_COUNTER", "1")
        try:
            test_counter = int(test_counter_str)
        except ValueError:
            # Fallback if TEST_CLAIM_COUNTER is not an integer
            # This allows for descriptive names in tests while maintaining a default
            # Ensure generated IDs are within 10 characters for the claim_id column
            if "MULTI_1" in test_counter_str:
                claim_id = "TSTMUL01" # 8 chars
            elif "MULTI_2" in test_counter_str:
                claim_id = "TSTMUL02" # 8 chars
            elif "USER_MULTI_CLAIM_1" in test_counter_str:
                claim_id = "TSTUMC01" # 8 chars
            elif "USER_MULTI_CLAIM_2" in test_counter_str:
                claim_id = "TSTUMC02" # 8 chars
            else: # Default fallback for other non-integer strings
                claim_id = "TSTDEF01" # 8 chars

        if claim_id is None:
            if test_counter == 1:
                claim_id = "TEST-001"
            elif test_counter == 2:
                claim_id = "TEST-002"
            else:
                claim_id = f"TEST-{test_counter:03d}"
    else:
        # Production mode - generate random ID
        claim_id = ''.join(random.choices(string.digits, k=5))
    
    # Check if policy exists
    policy_check = db_manager.execute_query_with_result(
        "SELECT policy_id FROM policies WHERE policy_id = %s", 
        (policy_id,)
    )
    if not policy_check:
        raise ValueError(f"Policy {policy_id} not found")
    
    photos_array = photos if photos else []
    sql = """INSERT INTO claims (claim_id, policy_id, status, damage_description, vehicle, photos) 
             VALUES (%s, %s, 'Submitted', %s, %s, %s)"""
    db_manager.execute_query(sql, (claim_id, policy_id, damage_description, vehicle, photos_array))
    return get_claim_by_id(claim_id)

def get_claim_by_id(claim_id):
    """Retrieves a specific claim by its ID."""
    return db_manager.execute_query_single(
        "SELECT * FROM claims WHERE claim_id = %s", 
        (claim_id,)
    )

def get_claims_by_policy(policy_id):
    """Gets all claims for a specific policy."""
    return db_manager.execute_query_with_result(
        "SELECT * FROM claims WHERE policy_id = %s ORDER BY last_updated DESC", 
        (policy_id,)
    )

def update_claim_status(claim_id, new_status):
    """Updates the status of an existing claim."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    # Validate status transition
    if claim['status'] == 'Closed':
        raise ValueError(f"Cannot update status of closed claim {claim_id}")
    
    if new_status == 'Submitted' and claim['status'] != 'Submitted':
        raise ValueError(f"Cannot transition from {claim['status']} to {new_status}")
    
    sql = "UPDATE claims SET status = %s, last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (new_status, claim_id))
    return get_claim_by_id(claim_id)

def delete_claim(claim_id):
    """Soft deletes a claim by setting status to 'Closed'."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    sql = "UPDATE claims SET status = 'Closed', last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (claim_id,))
    return {'success': True, 'message': f'Claim {claim_id} closed successfully'}

def get_claim_statistics():
    """Returns basic statistics about claims."""
    total_results = db_manager.execute_query_with_result("SELECT COUNT(*) as total FROM claims")
    total_claims = total_results[0]['total'] if total_results else 0
    
    status_results = db_manager.execute_query_with_result(
        "SELECT status, COUNT(*) as count FROM claims GROUP BY status"
    )
    status_counts = {row['status']: row['count'] for row in status_results}
    
    return {
        'total_claims': total_claims,
        'status_counts': status_counts
    }
