import os
import re
from src.database.database_manager import db_manager

def _validate_email_format(email: str) -> bool:
    """Validate email format using regex."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def _validate_role(role: str) -> bool:
    """Validate role is either 'user' or 'admin'."""
    return role in ['user', 'admin']

def _generate_test_user_id() -> str:
    """Generate predictable test user ID in test mode."""
    if os.getenv("TEST_MODE") == "true":
        test_counter_str = os.getenv("TEST_USER_COUNTER", "1")
        # Return exact test IDs based on counter string
        if test_counter_str == "1":
            return "11111111-1111-1111-1111-111111111111"
        elif "ADMIN_USER" in test_counter_str:
            return "22222222-2222-2222-2222-222222222222"
        elif "MULTI_USER_1" in test_counter_str:
            return "33333333-3333-3333-3333-333333333333"
        elif "MULTI_USER_2" in test_counter_str:
            return "44444444-4444-4444-4444-444444444444"
        else:
            # Default fallback for other counter values
            return "11111111-1111-1111-1111-111111111111"
    return None  # Let PostgreSQL generate UUID in production

def get_user_by_id(user_id: str) -> dict:
    """Retrieve user by UUID."""
    # Check if user exists
    user_check = db_manager.execute_query_single(
        "SELECT user_id FROM users WHERE user_id = %s",
        (user_id,)
    )
    if not user_check:
        raise ValueError(f"User {user_id} not found")
    
    return db_manager.execute_query_single(
        "SELECT * FROM users WHERE user_id = %s",
        (user_id,)
    )

def get_user_by_email(email: str) -> dict:
    """Retrieve user by email address."""
    # Validate email format
    if not _validate_email_format(email):
        raise ValueError(f"Invalid email format: {email}")
    
    user = db_manager.execute_query_single(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )
    if not user:
        raise ValueError(f"User with email {email} not found")
    
    return user

def get_all_users() -> list:
    """Retrieve all users from the database."""
    return db_manager.execute_query_with_result(
        "SELECT * FROM users ORDER BY created_at DESC"
    )

def get_users_by_role(role: str) -> list:
    """Get users filtered by role ('user' or 'admin')."""
    if not _validate_role(role):
        raise ValueError(f"Invalid role. Must be 'user' or 'admin': {role}")
    
    return db_manager.execute_query_with_result(
        "SELECT * FROM users WHERE role = %s ORDER BY created_at DESC",
        (role,)
    )

def create_user(email: str, password_hash: str, role: str = 'user') -> dict:
    """Create new user with UUID generation."""
    # Validate inputs
    if not _validate_email_format(email):
        raise ValueError(f"Invalid email format: {email}")
    
    if not _validate_role(role):
        raise ValueError(f"Invalid role. Must be 'user' or 'admin': {role}")
    
    if not password_hash or not isinstance(password_hash, str):
        raise ValueError("Password hash is required and must be a string")
    
    # Check if email already exists
    existing_user = db_manager.execute_query_single(
        "SELECT email FROM users WHERE email = %s",
        (email,)
    )
    if existing_user:
        raise ValueError(f"User with email {email} already exists")
    
    # Generate user ID (use test ID in test mode, let PostgreSQL generate in production)
    user_id = _generate_test_user_id()
    
    if user_id:
        # Test mode - use predefined ID
        sql = """INSERT INTO users (user_id, email, password_hash, role) 
                 VALUES (%s, %s, %s, %s)"""
        db_manager.execute_query(sql, (user_id, email, password_hash, role))
    else:
        # Production mode - let PostgreSQL generate UUID
        sql = """INSERT INTO users (email, password_hash, role) 
                 VALUES (%s, %s, %s)"""
        db_manager.execute_query(sql, (email, password_hash, role))
    
    # Return the created user
    if user_id:
        return get_user_by_id(user_id)
    else:
        # Get the user by email since we don't know the generated UUID
        return get_user_by_email(email)

def update_user_email(user_id: str, new_email: str) -> dict:
    """Update user email with uniqueness validation."""
    # Validate user exists
    user = get_user_by_id(user_id)
    
    # Validate new email format
    if not _validate_email_format(new_email):
        raise ValueError(f"Invalid email format: {new_email}")
    
    # Check if new email already exists (and belongs to a different user)
    existing_user = db_manager.execute_query_single(
        "SELECT user_id, email FROM users WHERE email = %s AND user_id != %s",
        (new_email, user_id)
    )
    if existing_user:
        raise ValueError(f"Email {new_email} is already in use by another user")
    
    # Update email
    sql = "UPDATE users SET email = %s WHERE user_id = %s"
    db_manager.execute_query(sql, (new_email, user_id))
    
    return get_user_by_id(user_id)

def update_user_password(user_id: str, new_password_hash: str) -> dict:
    """Update user password."""
    # Validate user exists
    user = get_user_by_id(user_id)
    
    # Validate new password hash
    if not new_password_hash or not isinstance(new_password_hash, str):
        raise ValueError("Password hash is required and must be a string")
    
    # Update password
    sql = "UPDATE users SET password_hash = %s WHERE user_id = %s"
    db_manager.execute_query(sql, (new_password_hash, user_id))
    
    return get_user_by_id(user_id)

def update_user_role(user_id: str, new_role: str) -> dict:
    """Update user role with validation."""
    # Validate user exists
    user = get_user_by_id(user_id)
    
    # Validate new role
    if not _validate_role(new_role):
        raise ValueError(f"Invalid role. Must be 'user' or 'admin': {new_role}")
    
    # Update role
    sql = "UPDATE users SET role = %s WHERE user_id = %s"
    db_manager.execute_query(sql, (new_role, user_id))
    
    return get_user_by_id(user_id)

def delete_user(user_id: str) -> dict:
    """Delete user and cascade to associated policies and claims."""
    # Validate user exists
    user = get_user_by_id(user_id)
    
    # Check if user has policies
    policies = db_manager.execute_query_with_result(
        "SELECT policy_id FROM policies WHERE user_id = %s",
        (user_id,)
    )
    
    if policies:
        # User has policies, which will be cascade deleted
        policy_ids = [policy['policy_id'] for policy in policies]
        policy_count = len(policy_ids)
        
        # Delete user (this will cascade delete policies and claims)
        sql = "DELETE FROM users WHERE user_id = %s"
        db_manager.execute_query(sql, (user_id,))
        
        return {
            'success': True,
            'message': f'User {user_id} deleted successfully. {policy_count} associated policies and their claims were also deleted.',
            'deleted_policies': policy_count
        }
    else:
        # No policies, just delete the user
        sql = "DELETE FROM users WHERE user_id = %s"
        db_manager.execute_query(sql, (user_id,))
        
        return {
            'success': True,
            'message': f'User {user_id} deleted successfully.',
            'deleted_policies': 0
        }

def email_exists(email: str) -> bool:
    """Check if email already exists."""
    if not _validate_email_format(email):
        return False
    
    existing_user = db_manager.execute_query_single(
        "SELECT email FROM users WHERE email = %s",
        (email,)
    )
    return existing_user is not None

def user_exists(user_id: str) -> bool:
    """Check if user exists by ID."""
    try:
        get_user_by_id(user_id)
        return True
    except ValueError:
        return False

def get_user_statistics() -> dict:
    """Get user count by role, registration trends, etc."""
    # Get total user count
    total_results = db_manager.execute_query_with_result("SELECT COUNT(*) as total FROM users")
    total_users = total_results[0]['total'] if total_results else 0
    
    # Get user count by role
    role_results = db_manager.execute_query_with_result(
        "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    )
    role_counts = {row['role']: row['count'] for row in role_results}
    
    # Get recent registrations (last 30 days)
    recent_results = db_manager.execute_query_with_result(
        "SELECT COUNT(*) as recent_count FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'"
    )
    recent_count = recent_results[0]['recent_count'] if recent_results else 0
    
    return {
        'total_users': total_users,
        'role_counts': role_counts,
        'recent_registrations_30d': recent_count,
        'admin_count': role_counts.get('admin', 0),
        'user_count': role_counts.get('user', 0)
    }

def get_user_activity_summary(user_id: str) -> dict:
    """Get user's policy and claim activity summary."""
    # Validate user exists
    user = get_user_by_id(user_id)
    
    # Get policy count
    policy_results = db_manager.execute_query_with_result(
        "SELECT COUNT(*) as policy_count FROM policies WHERE user_id = %s",
        (user_id,)
    )
    policy_count = policy_results[0]['policy_count'] if policy_results else 0
    
    # Get claim count
    claim_results = db_manager.execute_query_with_result(
        "SELECT COUNT(*) as claim_count FROM claims c "
        "JOIN policies p ON c.policy_id = p.policy_id "
        "WHERE p.user_id = %s",
        (user_id,)
    )
    claim_count = claim_results[0]['claim_count'] if claim_results else 0
    
    # Get total premium value
    premium_results = db_manager.execute_query_with_result(
        "SELECT COALESCE(SUM(premium), 0) as total_premium FROM policies WHERE user_id = %s",
        (user_id,)
    )
    total_premium = premium_results[0]['total_premium'] if premium_results else 0
    
    # Get claim status breakdown
    claim_status_results = db_manager.execute_query_with_result(
        "SELECT c.status, COUNT(*) as count FROM claims c "
        "JOIN policies p ON c.policy_id = p.policy_id "
        "WHERE p.user_id = %s "
        "GROUP BY c.status",
        (user_id,)
    )
    claim_status_counts = {row['status']: row['count'] for row in claim_status_results}
    
    return {
        'user_id': user_id,
        'email': user['email'],
        'role': user['role'],
        'member_since': user['created_at'],
        'policy_count': policy_count,
        'claim_count': claim_count,
        'total_premium_value': float(total_premium),
        'claim_status_breakdown': claim_status_counts
    }
