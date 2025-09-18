from src.data_processing.knowledge_base_loader import insert_knowledge_base, generate_vectors_kb_optimized

if __name__ == "__main__":
    # insert_knowledge_base("data/knowledge_base/faq.md")
    
    # Generate vectors for knowledge base entries
    count = generate_vectors_kb_optimized()
    print(f"Successfully generated vectors for {count} knowledge base entries")
   
    