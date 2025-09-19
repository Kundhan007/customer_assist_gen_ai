"""
Master conftest.py file that imports from specialized conftest modules.
This keeps the main conftest.py clean and under 200 lines while maintaining
all the original functionality.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This ensures that DB_PASSWORD and other variables are available
# before any database modules are imported.
env_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'config', '.env')
load_dotenv(dotenv_path=env_path)

# Import all fixtures and configurations from specialized modules
from .conftest_common import *
from .conftest_database import *
from .conftest_claims import *
from .conftest_policies import *
