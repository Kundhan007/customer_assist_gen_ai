import os
import psycopg2
import psycopg2.extras
import psycopg2.pool
from dotenv import load_dotenv
from threading import Lock

load_dotenv(dotenv_path='src/config/.env')

# Register the json adapter
psycopg2.extensions.register_adapter(dict, psycopg2.extras.Json)

class DatabaseManager:
    """
    Singleton database manager with connection pooling for efficient database operations.
    """
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(DatabaseManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
            
        # Connection pool configuration
        self.minconn = 1
        self.maxconn = 10  # Adjust based on your needs
        self.pool = None
        self._initialize_pool()
        self._initialized = True
    
    def _initialize_pool(self):
        """Initialize the connection pool."""
        try:
            self.pool = psycopg2.pool.ThreadedConnectionPool(
                self.minconn,
                self.maxconn,
                dbname=os.getenv("DB_NAME"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=os.getenv("DB_PORT")
            )
            print(f"Database connection pool initialized with {self.minconn}-{self.maxconn} connections")
        except Exception as e:
            print(f"Failed to initialize connection pool: {e}")
            raise
    
    def get_connection(self):
        """Get a connection from the pool."""
        if not self.pool:
            self._initialize_pool()
        return self.pool.getconn()
    
    def release_connection(self, conn):
        """Release a connection back to the pool."""
        if self.pool and conn:
            self.pool.putconn(conn)
    
    def execute_query(self, sql, params=None):
        """Execute a query that doesn't return results (INSERT, UPDATE, DELETE)."""
        conn = None
        cur = None
        try:
            conn = self.get_connection()
            cur = conn.cursor()
            if params:
                cur.execute(sql, params)
            else:
                cur.execute(sql)
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"Database error: {e}")
            raise
        finally:
            if cur:
                cur.close()
            if conn:
                self.release_connection(conn)
    
    def execute_query_with_result(self, sql, params=None):
        """Execute a query that returns results (SELECT)."""
        conn = None
        cur = None
        try:
            conn = self.get_connection()
            cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
            if params:
                cur.execute(sql, params)
            else:
                cur.execute(sql)
            
            if cur.description:
                results = cur.fetchall()
                return [dict(row) for row in results]
            return []
        except Exception as e:
            print(f"Database error: {e}")
            raise
        finally:
            if cur:
                cur.close()
            if conn:
                self.release_connection(conn)
    
    def execute_query_single(self, sql, params=None):
        """Execute a query that returns a single result."""
        results = self.execute_query_with_result(sql, params)
        return results[0] if results else None
    
    def close_all_connections(self):
        """Close all connections in the pool."""
        if self.pool:
            self.pool.closeall()
            print("All database connections closed")

# Global instance for easy access
db_manager = DatabaseManager()
