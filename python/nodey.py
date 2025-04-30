from flask import Flask, request, jsonify
import os
import base64
import json
import requests

app = Flask(__name__)

python_port = int(os.getenv("PYTHON_NODEY_PORT", 1931))
node_host = os.getenv("NODE_SERVICE", "http://node:8103")

class PyNodey:
    def __init__(self):
        self.port = python_port
        if not self.port:
            raise Exception("PyNodey requires PYTHON_NODEY_PORT to run.")

        self.share_object = {}

        @app.route("/", methods=["GET"])
        def health_check():
            return "OK", 200

        @app.route("/", methods=["POST"])
        def base_response():
            return "OK", 200

        @app.route("/ask", methods=["POST"])
        def ask_handler():
            try:
                data = request.get_json()
                token = data.get("asking_about")
                if token not in self.share_object:
                    return jsonify({"error": "Invalid token"}), 400
                result = self.share_object[token]()
                encoded = base64.b64encode(json.dumps(result).encode()).decode()
                return jsonify({"data": encoded})
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    def set(self, share_object):
        if not isinstance(share_object, dict):
            raise Exception("set() received bad arguments")
        self.share_object = share_object

    def ask(self, token):
        if not token:
            raise Exception("Token is required to get data from Node.")

        try:
            response = requests.post(
                f"{node_host}/ask",
                json={"asking_about": token},
                timeout=5
            )
            response.raise_for_status()
            response_json = response.json()
            encoded_data = response_json.get("data")
            decoded = base64.b64decode(encoded_data).decode()
            return json.loads(decoded)
        except Exception as e:
            raise Exception(f"Failed to ask node: {e}")

    def start(self):
        print(f"PyNodey listening on port {self.port}")
        app.run(host="0.0.0.0", port=self.port)

# === Usage ===
# if __name__ == "__main__":
#     pynodey = PyNodey()

#     pynodey.set({
#         "Customers_in_db": lambda: "This is the data from Python",
#         "Some_number": lambda: 1337,
#         "Hello_obj": lambda: {"message": "Hello from Python!"}
#     })

#     pynodey.start()
