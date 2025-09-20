import os
import requests
import json
from typing import Dict, List, Optional, Any
from src.config import Config

class NestJSClient:
    """HTTP client for communicating with NestJS backend API"""
    
    def __init__(self, base_url: str = None, jwt_token: str = None):
        self.base_url = base_url or os.getenv('NESTJS_API_URL', 'http://localhost:3000')
        self.jwt_token = jwt_token
        self.session = requests.Session()
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
        })
        
        if self.jwt_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.jwt_token}'
            })
    
    def set_jwt_token(self, token: str):
        """Set JWT token for authentication"""
        self.jwt_token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> Dict:
        """Make HTTP request to NestJS API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=30
            )
            
            # Handle response
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 201:
                return response.json()
            elif response.status_code == 401:
                raise ValueError("Authentication failed - invalid or expired token")
            elif response.status_code == 403:
                raise ValueError("Access denied - insufficient permissions")
            elif response.status_code == 404:
                raise ValueError("Resource not found")
            elif response.status_code == 400:
                raise ValueError(f"Bad request: {response.text}")
            else:
                raise ValueError(f"API request failed: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Network error: {str(e)}")
    
    # Authentication
    def login(self, email: str, password: str) -> Dict:
        """Login and get JWT token"""
        data = {
            'email': email,
            'password': password
        }
        response = self._make_request('POST', '/auth/login', data)
        if 'access_token' in response:
            self.set_jwt_token(response['access_token'])
        return response
    
    # User Operations (User scope - auto-scoped to authenticated user)
    def get_user_profile(self) -> Dict:
        """Get current user's profile"""
        return self._make_request('GET', '/user/profile')
    
    def update_user_profile(self, email: str) -> Dict:
        """Update current user's profile"""
        data = {'email': email}
        return self._make_request('PATCH', '/user/profile', data)
    
    # Policy Operations (User scope)
    def get_user_policies(self) -> List[Dict]:
        """Get current user's policies"""
        return self._make_request('GET', '/user/policies')
    
    def get_user_active_policies(self) -> List[Dict]:
        """Get current user's active policies"""
        return self._make_request('GET', '/user/policies/active')
    
    def get_user_policy_by_id(self, policy_id: str) -> Dict:
        """Get specific policy by ID (user scope)"""
        return self._make_request('GET', f'/user/policies/{policy_id}')
    
    # Claims Operations (User scope)
    def create_user_claim(self, policy_id: str, description: str, vehicle: Dict, photos: List[str] = None) -> Dict:
        """Create new claim (user scope)"""
        data = {
            'policyId': policy_id,
            'description': description,
            'vehicle': vehicle,
            'photos': photos or []
        }
        return self._make_request('POST', '/user/claims', data)
    
    def get_user_claims(self, active_only: bool = False) -> List[Dict]:
        """Get current user's claims"""
        params = {'active': 'true'} if active_only else {}
        return self._make_request('GET', '/user/claims', params=params)
    
    def get_user_claim_by_id(self, claim_id: str) -> Dict:
        """Get specific claim by ID (user scope)"""
        return self._make_request('GET', f'/user/claims/{claim_id}')
    
    def get_user_claim_history(self, claim_id: str) -> List[Dict]:
        """Get claim history (user scope)"""
        return self._make_request('GET', f'/user/claims/{claim_id}/history')
    
    # Premium Operations (User scope)
    def calculate_premium(self, policy_id: str, previous_coverage: int, new_coverage: int) -> Dict:
        """Calculate premium (user scope)"""
        data = {
            'policy_id': policy_id,
            'previous_coverage': previous_coverage,
            'new_coverage': new_coverage
        }
        return self._make_request('POST', '/user/premium/calculate', data)
    
    def get_user_premium_history(self) -> List[Dict]:
        """Get user's premium history"""
        return self._make_request('GET', '/user/premium/history')
    
    def get_user_policy_premium_history(self, policy_id: str) -> List[Dict]:
        """Get premium history for specific policy (user scope)"""
        return self._make_request('GET', f'/user/premium/policy/{policy_id}')
    
    # Claim History Operations (User scope)
    def get_user_claim_history_full(self) -> List[Dict]:
        """Get user's complete claim history"""
        return self._make_request('GET', '/user/claim-history')
    
    def get_user_claim_history_by_claim_id(self, claim_id: str) -> List[Dict]:
        """Get history for specific claim (user scope)"""
        return self._make_request('GET', f'/user/claim-history/claim/{claim_id}')
    
    # Admin Operations (Admin scope - can access any data)
    def get_all_users(self) -> List[Dict]:
        """Get all users (admin scope)"""
        return self._make_request('GET', '/admin/users')
    
    def create_user(self, email: str, password: str, role: str = 'user') -> Dict:
        """Create new user (admin scope)"""
        data = {
            'email': email,
            'password': password,
            'role': role
        }
        return self._make_request('POST', '/admin/users', data)
    
    def get_user_by_id_admin(self, user_id: str) -> Dict:
        """Get specific user by ID (admin scope)"""
        return self._make_request('GET', f'/admin/users/{user_id}')
    
    def get_user_policies_admin(self, user_id: str) -> List[Dict]:
        """Get user's policies (admin scope)"""
        return self._make_request('GET', f'/admin/users/{user_id}/policies')
    
    def get_user_claims_admin(self, user_id: str) -> List[Dict]:
        """Get user's claims (admin scope)"""
        return self._make_request('GET', f'/admin/users/{user_id}/claims')
    
    def get_all_policies(self) -> List[Dict]:
        """Get all policies (admin scope)"""
        return self._make_request('GET', '/admin/policies')
    
    def create_policy(self, policy_data: Dict) -> Dict:
        """Create new policy (admin scope)"""
        return self._make_request('POST', '/admin/policies', policy_data)
    
    def get_policy_by_id_admin(self, policy_id: str) -> Dict:
        """Get specific policy by ID (admin scope)"""
        return self._make_request('GET', f'/admin/policies/{policy_id}')
    
    def get_all_claims(self) -> List[Dict]:
        """Get all claims (admin scope)"""
        return self._make_request('GET', '/admin/claims')
    
    def get_claim_by_id_admin(self, claim_id: str) -> Dict:
        """Get specific claim by ID (admin scope)"""
        return self._make_request('GET', f'/admin/claims/{claim_id}')
    
    def update_claim_status(self, claim_id: str, status: str) -> Dict:
        """Update claim status (admin scope)"""
        data = {'status': status}
        return self._make_request('POST', f'/admin/claims/{claim_id}/status', data)
    
    def delete_claim(self, claim_id: str) -> Dict:
        """Delete claim (admin scope)"""
        return self._make_request('DELETE', f'/admin/claims/{claim_id}')
    
    # Knowledge Base Operations (Admin scope)
    def upload_knowledge_base(self, file_data: Dict) -> Dict:
        """Upload knowledge base (admin scope)"""
        return self._make_request('POST', '/admin/kb', file_data)
    
    def delete_knowledge_base_entry(self, entry_id: str) -> Dict:
        """Delete knowledge base entry (admin scope)"""
        return self._make_request('DELETE', f'/admin/kb/{entry_id}')
    
    # Statistics Operations (Admin scope)
    def get_system_statistics(self) -> Dict:
        """Get system statistics (admin scope)"""
        return self._make_request('GET', '/admin/statistics')
    
    def get_user_statistics(self) -> Dict:
        """Get user statistics (admin scope)"""
        return self._make_request('GET', '/admin/statistics/users')
    
    def get_policy_statistics(self) -> Dict:
        """Get policy statistics (admin scope)"""
        return self._make_request('GET', '/admin/statistics/policies')
    
    def get_claim_statistics(self) -> Dict:
        """Get claim statistics (admin scope)"""
        return self._make_request('GET', '/admin/statistics/claims')
    
    # Premium Operations (Admin scope)
    def get_all_premium_history(self) -> List[Dict]:
        """Get all premium history (admin scope)"""
        return self._make_request('GET', '/admin/premium/history')
    
    def get_policy_premium_history_admin(self, policy_id: str) -> List[Dict]:
        """Get premium history for any policy (admin scope)"""
        return self._make_request('GET', f'/admin/premium/policy/{policy_id}')
    
    # Chat Operations
    def send_chat_message(self, message: str, session_id: str = None) -> Dict:
        """Send chat message"""
        data = {
            'message': message,
            'sessionId': session_id
        }
        return self._make_request('POST', '/user/chat', data)
    
    def get_chat_history(self) -> List[Dict]:
        """Get chat history"""
        return self._make_request('GET', '/user/chat/history')
    
    def get_chat_session(self, session_id: str) -> Dict:
        """Get specific chat session"""
        return self._make_request('GET', f'/user/chat/history/{session_id}')
    
    def get_chat_statistics_admin(self) -> Dict:
        """Get chat statistics (admin scope)"""
        return self._make_request('GET', '/chat/statistics')
    
    # Health check
    def health_check(self) -> Dict:
        """Check API health"""
        return self._make_request('GET', '/health')
    
    # Utility methods
    def is_admin(self) -> bool:
        """Check if current token has admin privileges"""
        try:
            # Try to access an admin endpoint
            self.get_system_statistics()
            return True
        except ValueError as e:
            if "Access denied" in str(e):
                return False
            raise
    
    def get_current_user_info(self) -> Dict:
        """Get current user information from token"""
        try:
            return self.get_user_profile()
        except ValueError as e:
            if "Authentication failed" in str(e):
                return {}
            raise


# Global client instance
_nestjs_client = None

def get_nestjs_client(jwt_token: str = None, user_role: str = 'user') -> NestJSClient:
    """Get or create NestJS client instance"""
    global _nestjs_client
    
    # Get admin credentials if admin role is requested
    if user_role == 'admin':
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        # Create new client for admin
        admin_client = NestJSClient()
        try:
            # Login as admin
            login_response = admin_client.login(admin_email, admin_password)
            return admin_client
        except ValueError as e:
            # If admin login fails, try to use provided token
            if jwt_token:
                admin_client.set_jwt_token(jwt_token)
                return admin_client
            raise
    else:
        # User client
        if not _nestjs_client:
            _nestjs_client = NestJSClient(jwt_token=jwt_token)
        elif jwt_token and jwt_token != _nestjs_client.jwt_token:
            _nestjs_client.set_jwt_token(jwt_token)
        
        return _nestjs_client


def create_client_for_user(user_email: str, user_password: str) -> NestJSClient:
    """Create and authenticate client for specific user"""
    client = NestJSClient()
    client.login(user_email, user_password)
    return client
