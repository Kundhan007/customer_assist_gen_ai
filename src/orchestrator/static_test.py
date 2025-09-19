import os
import sys
from dotenv import load_dotenv

# Add the project root to the Python path to allow for absolute imports like 'src.orchestrator'
# This assumes the script is in src/orchestrator and the project root is two levels up.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.orchestrator.langhub import get_orchestrator_agent, run_agent
from src.data_processing.knowledge_base_loader import generate_vectors_kb_optimized
from src.database.database_manager import db_manager

# --- Test Data (Copied from src/tests/test_orchestrator.py and conftest_common.py) ---
TEST_USER_ID = "11111111-1111-1111-1111-111111111111"
TEST_USER_EMAIL = "test@example.com"
TEST_POLICY_ID = "test-001"
TEST_CLAIM_ID = "claim-001"

# Simplified list of questions for initial testing
TEST_QUESTIONS = [
    {
        "tool_name": "search_knowledge_base_tool",
        "question": "Search the knowledge base for information on 'roadside assistance coverage'.",
        "expected_keywords": ["roadside assistance", "coverage"]
    }
    # Other questions are commented out to isolate the agent's behavior
    # {
    #     "tool_name": "get_user_by_id_tool",
    #     "question": f"Fetch the details for the user with ID '{TEST_USER_ID}'.",
    #     "expected_keywords": ["user id", "email", "role"]
    # },
    # {
    #     "tool_name": "get_user_by_email_tool",
    #     "question": f"Look up the user information for the email address '{TEST_USER_EMAIL}'.",
    #     "expected_keywords": ["user id", "email", "role"]
    # },
    # {
    #     "tool_name": "create_claim_tool",
    #     "question": f"File a new claim for policy '{TEST_POLICY_ID}'. The damage is a 'minor scrape on the door'. The vehicle is a 2021 Toyota Corolla. Photos are not available.",
    #     "expected_keywords": ["claim id", "successfully filed"]
    # },
    # {
    #     "tool_name": "get_claim_by_id_tool",
    #     "question": f"Show me the details for claim '{TEST_CLAIM_ID}'.",
    #     "expected_keywords": ["claim id", "policy id", "status"]
    # },
    # {
    #     "tool_name": "get_claims_by_policy_tool",
    #     "question": f"List all the claims that have been filed under policy '{TEST_POLICY_ID}'.",
    #     "expected_keywords": ["claims", "policy id"]
    # },
    # {
    #     "tool_name": "get_policy_by_id_tool",
    #     "question": f"Retrieve the full details of the policy with ID '{TEST_POLICY_ID}'.",
    #     "expected_keywords": ["policy id", "user id", "plan name"]
    # },
    # {
    #     "tool_name": "get_policies_by_user_tool",
    #     "question": f"Find all the insurance policies for the user with ID '{TEST_USER_ID}'.",
    #     "expected_keywords": ["policies", "user id"]
    # },
    # {
    #     "tool_name": "calculate_premium_tool",
    #     "question": "What would be the premium for a 'Gold' plan with 500000 in collision coverage, including roadside assistance, and a 2000 deductible?",
    #     "expected_keywords": ["premium", "37,499.70"]
    # },
    # {
    #     "tool_name": "get_claim_history_by_user_id_tool",
    #     "question": f"Can you get the complete claim history for user '{TEST_USER_ID}', showing all their claims across all their policies?",
    #     "expected_keywords": ["11111111-1111-1111-1111-111111111111", "test-001"]
    # },
]

def ensure_kb_vectors():
    """
    Ensure that knowledge base vectors are generated before running the tests.
    This is crucial for the search_knowledge_base_tool to function.
    """
    print("Checking for knowledge base vectors...")
    try:
        # Check if any records have NULL embeddings
        conn = db_manager.get_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM knowledge_base WHERE embedding IS NULL;")
        null_count = cur.fetchone()[0]
        db_manager.release_connection(conn)

        if null_count > 0:
            print(f"Found {null_count} knowledge base entries without vectors. Generating them now...")
            generate_vectors_kb_optimized(update_existing=False) # Only generate for NULLs
            print("Knowledge base vector generation complete.")
        else:
            print("All knowledge base entries have vectors.")
    except Exception as e:
        print(f"Could not verify/generate knowledge base vectors: {e}")
        print("Tests relying on knowledge search may fail.")

def setup_test_data():
    """
    Sets up the necessary test data in the database.
    Replicates logic from src/tests/conftest_database.py
    """
    print("Setting up test data...")
    try:
        # Clean up existing data
        db_manager.execute_query("DELETE FROM claims WHERE claim_id = %s", (TEST_CLAIM_ID,))
        db_manager.execute_query("DELETE FROM policies WHERE policy_id = %s", (TEST_POLICY_ID,))
        db_manager.execute_query("DELETE FROM users WHERE user_id = %s", (TEST_USER_ID,))
        print("Cleaned up existing test data (if any).")

        # Create test user
        user_sql = """INSERT INTO users (user_id, email, password_hash, role) 
                      VALUES (%s, %s, %s, 'user')"""
        # Using a placeholder password hash
        db_manager.execute_query(user_sql, (TEST_USER_ID, TEST_USER_EMAIL, "test_password_hash_placeholder"))
        print(f"Test user {TEST_USER_ID} created.")

        # Create test policy
        policy_sql = """INSERT INTO policies (policy_id, user_id, plan_name, collision_coverage, 
                         roadside_assistance, deductible, premium) 
                         VALUES (%s, %s, 'Test Plan', 25000, false, 500, 200.00)"""
        db_manager.execute_query(policy_sql, (TEST_POLICY_ID, TEST_USER_ID))
        print(f"Test policy {TEST_POLICY_ID} created for user {TEST_USER_ID}.")

        # Create test claim
        claim_sql = """INSERT INTO claims (claim_id, policy_id, status, damage_description, 
                        vehicle) 
                        VALUES (%s, %s, %s, %s, %s)"""
        db_manager.execute_query(claim_sql, 
                                (TEST_CLAIM_ID, TEST_POLICY_ID, "Submitted", 
                                 "minor scrape on the door", "2021 Toyota Corolla"))
        print(f"Test claim {TEST_CLAIM_ID} created for policy {TEST_POLICY_ID}.")
        
        print("Test data setup complete.")
    except Exception as e:
        print(f"Error setting up test data: {e}")
        print("Subsequent tests relying on this data may fail.")

def main():
    """
    Main function to run the static test.
    """
    # Load environment variables from the .env file
    # The .env file is expected to be in src/config/
    env_path = os.path.join(project_root, 'src', 'config', '.env')
    if not os.path.exists(env_path):
        print(f"ERROR: .env file not found at {env_path}")
        print("Please create it with your OPENAI_API_KEY.")
        return

    load_dotenv(env_path)

    if not os.getenv("OPENAI_API_KEY"):
        print("ERROR: OPENAI_API_KEY not set in the environment variables.")
        print("Please ensure it is defined in your src/config/.env file.")
        return

    print("OPENAI_API_KEY loaded successfully.")

    # Ensure knowledge base vectors are present
    ensure_kb_vectors()

    # Setup test data in the database
    setup_test_data()

    print("\nInitializing orchestrator agent...")
    agent = get_orchestrator_agent(verbose=True)
    if not agent:
        print("Failed to initialize orchestrator agent.")
        return

    print("Orchestrator agent initialized successfully.\n")

    for i, test_item in enumerate(TEST_QUESTIONS):
        tool_name = test_item["tool_name"]
        question = test_item["question"]
        # expected_keywords = test_item["expected_keywords"] # Not used in this script, but kept for context

        print(f"--- Test {i+1}/{len(TEST_QUESTIONS)}: {tool_name} ---")
        print(f"Question: {question}\n")

        try:
            response = run_agent(question, agent=agent)
            print(f"\nAgent Answer: {response}\n")
        except Exception as e:
            print(f"\nAn error occurred while running the agent for '{tool_name}': {e}\n")
        
        print("-" * 50 + "\n")

    print("Static test run complete.")

if __name__ == "__main__":
    main()
