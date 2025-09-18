import os
import pytest
from src.agents.user_agent import (
    get_user_by_id,
    get_user_by_email,
    get_all_users,
    get_users_by_role,
    create_user,
    update_user_email,
    update_user_password,
    update_user_role,
    delete_user,
    email_exists,
    user_exists,
    get_user_statistics,
    get_user_activity_summary
)
from tests.conftest_common import (
    TEST_USER_ID,
    TEST_ADMIN_USER_ID,
    TEST_MULTI_USER_1,
    TEST_MULTI_USER_2,
    TEST_USER_EMAIL,
    TEST_ADMIN_EMAIL,
    TEST_PASSWORD_HASH
)

# Set test mode environment variable
os.environ["TEST_MODE"] = "true"

class TestUserAgent:
    """Test suite for user agent functions."""

    def test_create_user_success(self):
        """Test successful user creation."""
        os.environ["TEST_USER_COUNTER"] = "1"
        
        # Clean up any existing user with this email first
        try:
            existing_user = get_user_by_email("newuser@example.com")
            delete_user(existing_user['user_id'])
        except ValueError:
            # User doesn't exist, which is what we want
            pass
        
        user = create_user(
            email="newuser@example.com",
            password_hash="hashed_password_456",
            role="user"
        )
        
        assert user is not None
        assert user['email'] == "newuser@example.com"
        assert user['role'] == "user"
        assert user['user_id'] == TEST_USER_ID
        assert 'created_at' in user
        assert user['password_hash'] == "hashed_password_456"
        
        # Clean up the created user
        delete_user(user['user_id'])

    def test_create_user_admin_role(self):
        """Test user creation with admin role."""
        os.environ["TEST_USER_COUNTER"] = "ADMIN_USER"
        
        user = create_user(
            email="admin@example.com",
            password_hash="hashed_admin_password",
            role="admin"
        )
        
        assert user is not None
        assert user['email'] == "admin@example.com"
        assert user['role'] == "admin"
        assert user['user_id'] == TEST_ADMIN_USER_ID

    def test_create_user_invalid_email(self):
        """Test user creation with invalid email format."""
        with pytest.raises(ValueError, match="Invalid email format"):
            create_user(
                email="invalid-email",
                password_hash="hashed_password_123",
                role="user"
            )

    def test_create_user_invalid_role(self):
        """Test user creation with invalid role."""
        with pytest.raises(ValueError, match="Invalid role. Must be 'user' or 'admin'"):
            create_user(
                email="test@example.com",
                password_hash="hashed_password_123",
                role="invalid_role"
            )

    def test_create_user_missing_password(self):
        """Test user creation with missing password hash."""
        with pytest.raises(ValueError, match="Password hash is required and must be a string"):
            create_user(
                email="test@example.com",
                password_hash="",
                role="user"
            )

    def test_create_user_duplicate_email(self):
        """Test user creation with duplicate email."""
        # Create first user
        os.environ["TEST_USER_COUNTER"] = "1"
        create_user(
            email="duplicate@example.com",
            password_hash="hashed_password_123",
            role="user"
        )
        
        # Try to create user with same email
        with pytest.raises(ValueError, match="User with email duplicate@example.com already exists"):
            create_user(
                email="duplicate@example.com",
                password_hash="hashed_password_456",
                role="user"
            )

    def test_get_user_by_id_success(self, setup_test_user):
        """Test successful user retrieval by ID."""
        user_id = setup_test_user
        
        user = get_user_by_id(user_id)
        
        assert user is not None
        assert user['user_id'] == user_id
        assert user['email'] == TEST_USER_EMAIL
        assert user['role'] == "user"

    def test_get_user_by_id_invalid(self):
        """Test user retrieval with invalid ID."""
        invalid_user_id = "00000000-0000-0000-0000-000000000000"
        with pytest.raises(ValueError, match=f"User {invalid_user_id} not found"):
            get_user_by_id(invalid_user_id)

    def test_get_user_by_email_success(self, setup_test_user):
        """Test successful user retrieval by email."""
        user = get_user_by_email(TEST_USER_EMAIL)
        
        assert user is not None
        assert user['email'] == TEST_USER_EMAIL
        assert user['role'] == "user"
        assert 'user_id' in user

    def test_get_user_by_email_invalid_format(self):
        """Test user retrieval with invalid email format."""
        with pytest.raises(ValueError, match="Invalid email format"):
            get_user_by_email("invalid-email")

    def test_get_user_by_email_not_found(self):
        """Test user retrieval with non-existent email."""
        with pytest.raises(ValueError, match="User with email nonexistent@example.com not found"):
            get_user_by_email("nonexistent@example.com")

    def test_get_all_users(self, setup_test_user):
        """Test retrieving all users."""
        users = get_all_users()
        
        assert isinstance(users, list)
        assert len(users) >= 1
        
        # Find our test user
        test_user = next((u for u in users if u['email'] == TEST_USER_EMAIL), None)
        assert test_user is not None
        assert test_user['role'] == "user"

    def test_get_users_by_role_success(self, setup_test_user):
        """Test retrieving users by role."""
        users = get_users_by_role("user")
        
        assert isinstance(users, list)
        assert len(users) >= 1
        
        # All returned users should have the specified role
        for user in users:
            assert user['role'] == "user"

    def test_get_users_by_role_admin(self, setup_test_admin_user):
        """Test retrieving admin users."""
        users = get_users_by_role("admin")
        
        assert isinstance(users, list)
        assert len(users) >= 1
        
        # All returned users should be admins
        for user in users:
            assert user['role'] == "admin"

    def test_get_users_by_role_invalid(self):
        """Test retrieving users with invalid role."""
        with pytest.raises(ValueError, match="Invalid role. Must be 'user' or 'admin'"):
            get_users_by_role("invalid_role")

    def test_update_user_email_success(self, setup_test_user):
        """Test successful user email update."""
        user_id = setup_test_user
        
        updated_user = update_user_email(user_id, "updated@example.com")
        
        assert updated_user is not None
        assert updated_user['email'] == "updated@example.com"
        assert updated_user['user_id'] == user_id

    def test_update_user_email_invalid_format(self, setup_test_user):
        """Test email update with invalid format."""
        user_id = setup_test_user
        
        with pytest.raises(ValueError, match="Invalid email format"):
            update_user_email(user_id, "invalid-email")

    def test_update_user_email_duplicate(self, setup_test_user, setup_test_admin_user):
        """Test email update with duplicate email."""
        user_id = setup_test_user
        admin_user_id = setup_test_admin_user
        
        # Try to update user's email to admin's email
        with pytest.raises(ValueError, match="Email admin@test.com is already in use by another user"):
            update_user_email(user_id, TEST_ADMIN_EMAIL)

    def test_update_user_password_success(self, setup_test_user):
        """Test successful user password update."""
        user_id = setup_test_user
        
        updated_user = update_user_password(user_id, "new_hashed_password")
        
        assert updated_user is not None
        assert updated_user['password_hash'] == "new_hashed_password"
        assert updated_user['user_id'] == user_id

    def test_update_user_password_invalid(self, setup_test_user):
        """Test password update with invalid password hash."""
        user_id = setup_test_user
        
        with pytest.raises(ValueError, match="Password hash is required and must be a string"):
            update_user_password(user_id, "")

    def test_update_user_role_success(self, setup_test_user):
        """Test successful user role update."""
        user_id = setup_test_user
        
        updated_user = update_user_role(user_id, "admin")
        
        assert updated_user is not None
        assert updated_user['role'] == "admin"
        assert updated_user['user_id'] == user_id

    def test_update_user_role_invalid(self, setup_test_user):
        """Test role update with invalid role."""
        user_id = setup_test_user
        
        with pytest.raises(ValueError, match="Invalid role. Must be 'user' or 'admin'"):
            update_user_role(user_id, "invalid_role")

    def test_delete_user_success(self, setup_test_user):
        """Test successful user deletion."""
        user_id = setup_test_user
        
        result = delete_user(user_id)
        
        assert result['success'] is True
        assert f"User {user_id} deleted successfully" in result['message']
        assert result['deleted_policies'] == 0
        
        # Verify user is deleted
        with pytest.raises(ValueError, match=f"User {user_id} not found"):
            get_user_by_id(user_id)

    def test_delete_user_with_policies(self, setup_test_user_with_policies):
        """Test user deletion with associated policies."""
        user_id = setup_test_user_with_policies
        
        result = delete_user(user_id)
        
        assert result['success'] is True
        assert f"User {user_id} deleted successfully" in result['message']
        assert result['deleted_policies'] > 0

    def test_delete_user_invalid(self):
        """Test deletion of non-existent user."""
        invalid_user_id = "00000000-0000-0000-0000-000000000000"
        
        with pytest.raises(ValueError, match=f"User {invalid_user_id} not found"):
            delete_user(invalid_user_id)

    def test_email_exists_true(self, setup_test_user):
        """Test email_exists with existing email."""
        assert email_exists(TEST_USER_EMAIL) is True

    def test_email_exists_false(self):
        """Test email_exists with non-existent email."""
        assert email_exists("nonexistent@example.com") is False

    def test_email_exists_invalid_format(self):
        """Test email_exists with invalid email format."""
        assert email_exists("invalid-email") is False

    def test_user_exists_true(self, setup_test_user):
        """Test user_exists with existing user."""
        user_id = setup_test_user
        assert user_exists(user_id) is True

    def test_user_exists_false(self):
        """Test user_exists with non-existent user."""
        invalid_user_id = "00000000-0000-0000-0000-000000000000"
        assert user_exists(invalid_user_id) is False

    def test_get_user_statistics(self, setup_test_user, setup_test_admin_user):
        """Test getting user statistics."""
        stats = get_user_statistics()
        
        assert isinstance(stats, dict)
        assert 'total_users' in stats
        assert 'role_counts' in stats
        assert 'recent_registrations_30d' in stats
        assert 'admin_count' in stats
        assert 'user_count' in stats
        
        assert stats['total_users'] >= 2
        assert stats['admin_count'] >= 1
        assert stats['user_count'] >= 1
        assert 'admin' in stats['role_counts']
        assert 'user' in stats['role_counts']

    def test_get_user_activity_summary(self, setup_test_user_with_policies):
        """Test getting user activity summary."""
        user_id = setup_test_user_with_policies
        
        summary = get_user_activity_summary(user_id)
        
        assert isinstance(summary, dict)
        assert summary['user_id'] == user_id
        assert summary['email'] == TEST_USER_EMAIL
        assert summary['role'] == "user"
        assert 'member_since' in summary
        assert 'policy_count' in summary
        assert 'claim_count' in summary
        assert 'total_premium_value' in summary
        assert 'claim_status_breakdown' in summary
        
        assert summary['policy_count'] >= 0
        assert summary['claim_count'] >= 0
        assert isinstance(summary['total_premium_value'], (int, float))
        assert isinstance(summary['claim_status_breakdown'], dict)

    def test_get_user_activity_summary_no_activity(self, setup_test_user):
        """Test getting user activity summary for user with no activity."""
        user_id = setup_test_user
        
        summary = get_user_activity_summary(user_id)
        
        assert summary['policy_count'] == 0
        assert summary['claim_count'] == 0
        assert summary['total_premium_value'] == 0.0
        assert summary['claim_status_breakdown'] == {}

    def test_multiple_users_operations(self):
        """Test operations with multiple users."""
        # Create multiple users
        os.environ["TEST_USER_COUNTER"] = "MULTI_USER_1"
        user1 = create_user(
            email="multiuser1@example.com",
            password_hash="hashed_password_123",
            role="user"
        )
        
        os.environ["TEST_USER_COUNTER"] = "MULTI_USER_2"
        user2 = create_user(
            email="multiuser2@example.com",
            password_hash="hashed_password_456",
            role="admin"
        )
        
        # Test get_all_users
        all_users = get_all_users()
        assert len(all_users) >= 2
        
        # Test get_users_by_role for both roles
        regular_users = get_users_by_role("user")
        admin_users = get_users_by_role("admin")
        
        assert len(regular_users) >= 1
        assert len(admin_users) >= 1
        
        # Verify users are in correct lists
        user1_in_regular = any(u['user_id'] == user1['user_id'] for u in regular_users)
        user2_in_admin = any(u['user_id'] == user2['user_id'] for u in admin_users)
        
        assert user1_in_regular is True
        assert user2_in_admin is True
        
        # Clean up
        delete_user(user1['user_id'])
        delete_user(user2['user_id'])

# Add custom marker for user tests
def pytest_configure(config):
    """Configure pytest with custom markers."""
    try:
        config.addinivalue_line(
            "markers", "users: marks tests as user agent tests"
        )
    except ValueError:
        # Marker already exists
        pass

def pytest_collection_modifyitems(config, items):
    """Add custom markers to test items."""
    for item in items:
        if "test_user_agent.py" in str(item.fspath):
            item.add_marker(pytest.mark.users)
