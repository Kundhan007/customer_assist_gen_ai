# Car Insurance Database

## Tables & Data

**Tables:**
- `users` - User accounts (2 sample users)
- `policies` - Insurance policies (2 sample policies)  
- `claims` - Insurance claims (2 sample claims)
- `premium_history` - Premium change history (2 sample records)
- `knowledge_base` - Vector embeddings for AI (pgvector enabled)

**Sample Data Included:**
- User: user@example.com (Gold & Silver plans)
- Admin: admin@insure.com
- Claims with status tracking
- Premium adjustment history

**Quick Start:**
```bash
./intiation/docker/start-docker.sh
```

Access:
- DB: localhost:5432
- Adminer: http://localhost:8080
