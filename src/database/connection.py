import os
import psycopg2
import json
from psycopg2.extras import Json
from dotenv import load_dotenv

load_dotenv(dotenv_path='src/config/.env')

# Register the json adapter
psycopg2.extensions.register_adapter(dict, Json)

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT")
    )
    return conn

def execute_query(sql, params=None):
    """Executes a given SQL query with optional parameters.
    Handles connection, cursor, and transaction management.
    """
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        if params:
            cur.execute(sql, params)
        else:
            cur.execute(sql)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
        raise
    finally:
        cur.close()
        conn.close()
