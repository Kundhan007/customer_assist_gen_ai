import os
import psycopg2
import json
from psycopg2.extras import Json
from dotenv import load_dotenv
from .database_manager import db_manager

load_dotenv(dotenv_path='src/config/.env')

# Register the json adapter
psycopg2.extensions.register_adapter(dict, Json)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database using the connection pool."""
    return db_manager.get_connection()

def execute_query(sql, params=None):
    """Executes a given SQL query with optional parameters using the connection pool.
    Handles connection, cursor, and transaction management.
    """
    db_manager.execute_query(sql, params)
