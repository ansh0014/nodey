# server.py
from flask import Flask
import os

app = Flask(__name__)

# The main route
@app.route('/python', methods=['GET'])
def home():
    return '<h1>hoelaSSaa from python</h1>'

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 24224))  # Default 24224 if not set
    if not port:
        print("PYTHON_PORT environment variable is not set!")
        exit(1)

    print(f"Python server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
