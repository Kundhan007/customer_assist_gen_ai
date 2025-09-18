from src.database.connection import execute_query
from src.data_processing.file_readers import read_knowledge_base_md
from src.data_processing.text_vectorizer import TextVectorizer
import numpy as np

def insert_knowledge_base(file_path):
    """Reads a markdown file and inserts its content into the knowledge_base table."""
    qa_pairs = read_knowledge_base_md(file_path)
    
    for line in qa_pairs:
        question, answer = line.split('?', 1)
        question_text = (question + '?').strip()
        answer_text = answer.strip()
        full_text = f"{question_text} {answer_text}"
        
        sql = "INSERT INTO knowledge_base (source_type, text_chunk, embedding, metadata) VALUES (%s, %s, NULL, %s);"
        execute_query(sql, ('faq', full_text, {"question": question_text}))
    
    print(f"Successfully inserted knowledge base from {file_path}")

def generate_vectors_kb_optimized(model_name: str = 'all-MiniLM-L6-v2', batch_size: int = 50, update_existing: bool = False):
    """
    Generate or update vectors for knowledge base entries using optimized batch processing.
    
    Args:
        model_name (str): Name of the sentence transformer model to use.
        batch_size (int): Number of records to process in each batch.
        update_existing (bool): If True, update all records. If False, only update records with NULL embeddings.
    
    Returns:
        int: Number of records updated.
    """
    from src.database.connection import get_db_connection
    import psycopg2.extras
    
    # Initialize the text vectorizer
    vectorizer = TextVectorizer(model_name)
    
    conn = None
    updated_count = 0
    
    try:
        # Get a single connection for the entire operation
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get records based on update_existing flag
        if update_existing:
            get_sql = "SELECT doc_id, text_chunk FROM knowledge_base;"
            operation_type = "all records"
        else:
            get_sql = "SELECT doc_id, text_chunk FROM knowledge_base WHERE embedding IS NULL;"
            operation_type = "records with NULL embeddings"
        
        cur.execute(get_sql)
        records = cur.fetchall()
        
        if not records:
            print(f"No records found that need vectorization.")
            return 0
        
        print(f"Found {len(records)} {operation_type} to vectorize")
        
        # Process records in batches
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            
            # Extract doc_ids and text_chunks for the batch
            doc_ids = [record[0] for record in batch]
            text_chunks = [record[1] for record in batch]
            
            try:
                # Generate vectors for the entire batch at once
                vectors = vectorizer.vectorize_chunks_batch(text_chunks)
                
                # Prepare data for bulk update
                update_data = []
                for j, vector in enumerate(vectors):
                    vector_list = vector.tolist()
                    update_data.append((vector_list, doc_ids[j]))
                
                # Perform bulk update using executemany
                update_sql = "UPDATE knowledge_base SET embedding = %s WHERE doc_id = %s;"
                cur.executemany(update_sql, update_data)
                
                # Commit the batch
                conn.commit()
                
                batch_updated = len(update_data)
                updated_count += batch_updated
                
                print(f"Processed batch {i//batch_size + 1}: {batch_updated} records updated")
                
            except Exception as e:
                # Rollback the current batch and continue
                conn.rollback()
                print(f"Error processing batch {i//batch_size + 1}: {str(e)}")
                continue
        
        print(f"Successfully updated {updated_count} knowledge base vectors using model: {model_name}")
        return updated_count
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Database error: {str(e)}")
        raise
        
    finally:
        if conn:
            conn.close()
