# server.py
from flask import Flask
import os
import time
from nodey import PyNodey;

app = Flask(__name__)

# The main route
@app.route('/python', methods=['GET'])
def home():
    return '<h1>hoelaSSaa from python</h1>'

@app.route('/health', methods=['GET'])
def health_check():
    return '', 204

pynodey = PyNodey()

pynodey.set({
    "Customers_in_db": lambda: "this is the data from Python",
    "User_count": lambda: 42,
    "Greet": lambda: {"msg": "Hello from Python!"}
})

# Example of asking Node service for data
try:
   data_from_node = pynodey.ask("Greet")  # If "Greet" is a valid token in Nodey
   print("Data from Node:", data_from_node)
except Exception as e:
   print("Warning: could not ask Node at startup:", e)

pynodey.start()

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 24224))  # Default 24224 if not set
    if not port:
        print("PYTHON_PORT environment variable is not set!")
        exit(1)

    print(f"Python server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)

