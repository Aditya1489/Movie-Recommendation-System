#!/bin/bash
# ============================================
# Reset Watchlist Table
# ============================================
# Run this if you get watchlist errors
# 
# Usage: ./reset_watchlist.sh
# ============================================

set -e

cd "$(dirname "$0")"

source .venv/bin/activate

python3 << 'EOF'
import sqlite3

conn = sqlite3.connect('movie_app.db')
cursor = conn.cursor()

# Drop and recreate watchlist table
cursor.execute('DROP TABLE IF EXISTS watchlist')
cursor.execute('''
    CREATE TABLE watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        movie_id INTEGER,
        movie_title VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'To Watch',
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        UNIQUE (user_id, movie_id)
    )
''')

conn.commit()
conn.close()
print("✅ Watchlist table reset successfully!")
EOF
