import os
import random
import string
from src.database.database_manager import db_manager

def _generate_claim_id():
    """Generate a random 5-digit claim ID following existing pattern."""
    # Check if we're in test mode and should use fixed IDs
    if os.getenv("TEST_MODE") == "true":
        # Get test claim counter from environment or use default
        test_counter = int(os.getenv("TEST_CLAIM_COUNTER", "1"))
        if test_counter == 1:
            return "TEST-001"
        elif test_counter == 2:
            return "TEST-002"
        else:
            return f"TEST-{test_counter:03d}"
    return ''.join(random.choices(string.digits, k=5))

def _validate_status_transition(current_status, new_status):
    """Validate if status transition is allowed."""
    if current_status == 'Closed':
        return False
    if new_status == 'Submitted' and current_status != 'Submitted':
        return False
    return True

def create_claim(policy_id, damage_description, vehicle, photos=None):
    """Creates a new claim with auto-generated claim_id."""
    claim_id = _generate_claim_id()
    
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

def get_claims_by_status(status):
    """Gets all claims with a specific status."""
    valid_statuses = ['Submitted', 'In Review', 'Approved', 'Rejected', 'Closed']
    if status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
    
    return db_manager.execute_query_with_result(
        "SELECT * FROM claims WHERE status = %s ORDER BY last_updated DESC", 
        (status,)
    )

def update_claim_status(claim_id, new_status):
    """Updates the status of an existing claim."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    if not _validate_status_transition(claim['status'], new_status):
        raise ValueError(f"Cannot transition from {claim['status']} to {new_status}")
    
    sql = "UPDATE claims SET status = %s, last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (new_status, claim_id))
    return get_claim_by_id(claim_id)

def add_photos_to_claim(claim_id, photos):
    """Adds new photos to an existing claim."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    current_photos = claim['photos'] or []
    updated_photos = current_photos + photos
    
    sql = "UPDATE claims SET photos = %s, last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (updated_photos, claim_id))
    return get_claim_by_id(claim_id)

def update_damage_description(claim_id, new_description):
    """Updates the damage description for a claim."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    sql = "UPDATE claims SET damage_description = %s, last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (new_description, claim_id))
    return get_claim_by_id(claim_id)

def get_all_claims():
    """Retrieves all claims from the database."""
    return db_manager.execute_query_with_result(
        "SELECT * FROM claims ORDER BY last_updated DESC"
    )

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

def delete_claim(claim_id):
    """Soft deletes a claim by setting status to 'Closed'."""
    claim = get_claim_by_id(claim_id)
    if not claim:
        raise ValueError(f"Claim {claim_id} not found")
    
    sql = "UPDATE claims SET status = 'Closed', last_updated = CURRENT_TIMESTAMP WHERE claim_id = %s"
    db_manager.execute_query(sql, (claim_id,))
    return {'success': True, 'message': f'Claim {claim_id} closed successfully'}
