"""
Entry point for the Lumen Studio backend.

    python run.py

The server listens on http://localhost:5000 by default. Set the PORT
environment variable to change it.
"""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug, threaded=True)
