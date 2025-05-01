from flask import Flask
import os
import threading
from nodey import PyNodey;

app = Flask(__name__)
# allow trailing slash on routes
app.url_map.strict_slashes = False

# The main route
@app.route('/python', methods=['GET'])
def home():
    return '<h1>Hello from python</h1>'

@app.route('/python/', methods=['GET'])
def home_trailing():
    return home()

@app.route('/health', methods=['GET'])
def health_check():
    return '', 204

pynodey = PyNodey()

from datetime import datetime

# Equivalent to JavaScript's new Date().toFormatedString()
formatted_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

pynodey.set({
    "Customers_in_db": lambda: "this is the data from Python",
    "User_count": lambda: 42,
    "Greet": lambda: {"msg": "Hello from Python!"},
    "TIME": lambda: {"Date":formatted_date}
    })

# Example of asking Node service for data
try:
   data_from_node = pynodey.ask("Greet")  # If "Greet" is a valid token in Node
   print("Data from Node:", data_from_node)
except Exception as e:
   print("Warning: could not ask Node at startup:", e)

# start the PyNodey bridge in its own thread so it doesn't block the main Flask app
threading.Thread(target=pynodey.start, daemon=True).start()

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 24224))  # Default 24224 if not set
    if not port:
        print("PYTHON_PORT environment variable is not set!")
        exit(1)

    print(f"Python server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)

