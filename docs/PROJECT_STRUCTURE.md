# Project Structure Documentation

## Overview
The Customer Assist Gen AI project has been reorganized to follow a clean, modular structure that separates concerns and makes the codebase more maintainable.

## Directory Structure

```
customer_assist_gen_ai/
├── src/                          # Source code
│   ├── __init__.py              # Main package initialization
│   ├── config/                  # Configuration files
│   │   ├── __init__.py
│   │   └── .env                 # Environment variables
│   ├── database/                # Database-related code
│   │   ├── __init__.py
│   │   ├── connection.py        # Database connection utilities
│   │   └── migrations/          # Database schema files
│   │       └── car_insurance_schema.sql
│   ├── data_processing/         # Data processing utilities
│   │   ├── __init__.py
│   │   ├── file_readers.py      # File reading utilities
│   │   └── knowledge_base_loader.py  # Knowledge base data loader
│   └── scripts/                # Utility scripts
│       └── setup_database.sh    # Database setup script
├── data/                        # Data files
│   └── knowledge_base/          # Knowledge base data
│       └── faq.md              # FAQ knowledge base
├── deployment/                  # Deployment configuration
│   ├── requirements.txt         # Python dependencies
│   └── docker/                  # Docker configuration
│       ├── docker-compose.yml
│       └── start_docker.sh
├── tests/                       # Test files
│   └── __init__.py
├── docs/                        # Documentation
├── venv/                        # Virtual environment
├── .gitignore
└── README.md
```

## Module Descriptions

### src/config/
Contains configuration files and environment variables. The `.env` file stores database credentials and other sensitive configuration.

### src/database/
Handles all database-related functionality:
- `connection.py`: Database connection utilities and query execution functions
- `migrations/`: Database schema files for setting up the database structure

### src/data_processing/
Contains utilities for processing and loading data:
- `file_readers.py`: Functions for reading various file formats (markdown, etc.)
- `knowledge_base_loader.py`: Script for loading knowledge base data into the database

### src/scripts/
Utility scripts for various tasks:
- `setup_database.sh`: Script for setting up the database and loading initial data

### data/
Contains all data files used by the application:
- `knowledge_base/faq.md`: FAQ knowledge base in markdown format

### deployment/
Contains deployment-related files:
- `requirements.txt`: Python dependencies
- `docker/`: Docker configuration files for containerized deployment

## Key Changes Made

1. **Created modular structure**: Separated code into logical modules based on functionality
2. **Renamed files for clarity**: 
   - `database.py` → `connection.py`
   - `file_reader.py` → `file_readers.py`
   - `db_insert.py` → `knowledge_base_loader.py`
   - `run.sh` → `setup_database.sh`
   - `knowledge_base.md` → `faq.md`
3. **Updated import paths**: All imports now use the new module structure
4. **Added proper Python package structure**: Created `__init__.py` files for proper package recognition
5. **Organized data files**: Moved data files to a dedicated `data/` directory
6. **Cleaned up old structure**: Removed redundant directories and organized files logically

## Benefits of the New Structure

1. **Better separation of concerns**: Each module has a clear, single responsibility
2. **Improved maintainability**: Easier to find and modify specific functionality
3. **Scalability**: Easy to add new modules and features
4. **Clear import paths**: Python imports are now more intuitive and follow best practices
5. **Professional structure**: Follows common Python project conventions
6. **Easier testing**: Clear separation makes unit testing more straightforward

## Usage

To run the database setup:
```bash
./src/scripts/setup_database.sh
```

The script will automatically activate the virtual environment and run the knowledge base loader with the correct file paths.
