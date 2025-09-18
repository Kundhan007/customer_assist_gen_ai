from src.database.connection import execute_query
from src.data_processing.file_readers import read_knowledge_base_md

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
