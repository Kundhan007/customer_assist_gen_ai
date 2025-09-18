from src.database.database_manager import db_manager

def get_claim_history_by_policy_id(policy_id: str) -> list:
    """
    Retrieves all claims associated with a given policy_id,
    ordered chronologically by last_updated (most recent first).
    """
    # Check if policy exists
    policy_check = db_manager.execute_query_single(
        "SELECT policy_id FROM policies WHERE policy_id = %s",
        (policy_id,)
    )
    if not policy_check:
        raise ValueError(f"Policy {policy_id} not found")

    sql = """
        SELECT *
        FROM claims
        WHERE policy_id = %s
        ORDER BY last_updated DESC
    """
    claims = db_manager.execute_query_with_result(sql, (policy_id,))
    return claims

def get_claim_history_by_user_id(user_id: str) -> list:
    """
    Retrieves all claims for all policies belonging to a given user_id,
    ordered chronologically by last_updated.
    """
    # Check if user exists
    user_check = db_manager.execute_query_single(
        "SELECT user_id FROM users WHERE user_id = %s",
        (user_id,)
    )
    if not user_check:
        raise ValueError(f"User {user_id} not found")

    sql = """
        SELECT cl.*
        FROM claims cl
        JOIN policies p ON cl.policy_id = p.policy_id
        WHERE p.user_id = %s
        ORDER BY cl.last_updated DESC
    """
    claims = db_manager.execute_query_with_result(sql, (user_id,))
    return claims

def get_detailed_claim_history(claim_id: str) -> dict:
    """
    Retrieves the full record of a single claim, including its current status
    and the last_updated timestamp. Returns None if not found.
    """
    sql = """
        SELECT *
        FROM claims
        WHERE claim_id = %s
    """
    claim = db_manager.execute_query_single(sql, (claim_id,))
    return claim
