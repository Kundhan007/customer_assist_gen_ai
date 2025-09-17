def read_knowledge_base_md(file_path):
    """Reads a markdown file and returns a list of Q&A strings."""
    with open(file_path, 'r') as f:
        content = f.readlines()
    
    qa_pairs = []
    for line in content:
        if line.strip():
            qa_pairs.append(line.strip())
    return qa_pairs
