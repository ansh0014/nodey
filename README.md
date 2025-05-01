# Nodey — Dual Backend Architecture

### "Basically writing backend in JavaScript and Python simultaneously!"

**Nodey** is a microservice architecture template that runs **Node.js** and **Python** backend services in parallel, connected through bridge modules and surfaced via a central **Express.js-based load balancer**. Each backend can call into the other using a token-based API bridge.

This stack is ideal for projects that:
- Use different runtimes for different strengths (e.g., Python for ML, Node.js for real-time tasks),
- Need internal service-to-service communication,

---

## 1. How It All Works

### Components
- **Node App**: Main Node.js backend (serves content, exposes `/node`, etc.)
- **Python App**: Flask backend with its own endpoints (e.g., `/python`)
- **Bridge Modules**:
  - `node_bridge` (Node.js → Python communicator)
  - `python_bridge` (Python → Node.js communicator)
- **Load Balancer**: An Express.js server that acts as the public entry point, routing client requests to the right backend
- **Docker Compose**: Spins up everything in a defined order with health checks

---

## 2. System Flow (Step-by-Step)

### 1. Orchestration & Startup
- Docker Compose starts all containers on the same bridge network.
- Both **Node.js** and **Python** apps expose a `/health` route.
- The **load balancer waits** until both services are marked healthy before it starts listening.
- Bridge modules (`nodey.js`, `nodey.py`) **retry their peer connections** until successful. This allows them to gracefully handle staggered startups.

### 2. Load Balancer
- Reads `routes.json` at startup to determine where to send incoming requests (e.g., `/node` → Node backend).
- It doesn't expose any port until all required services are
- Automatically retries requests if a service is temporarily unreachable (e.g., network hiccups, slow boot).

### 3. Client Request Routing
- Clients send HTTP requests to the load balancer.
- The balancer uses the route mappings to forward each request to the correct backend (Node or Python).
- If a service fails temporarily, it retries the request.

### 4. Internal (Cross-Service) Communication
Both backends can call each other via a special `/ask` endpoint:
- The calling service sends a token: `{ "asking_about": "<token>" }`
- The bridge module maps this token to a handler function, calls it, and returns the result as **base64-encoded JSON**
- The receiving service decodes it and continues processing

This mechanism makes it easy to call logic in another runtime (e.g., Python asking Node for some preprocessed data, or vice versa).

---

## 3. Project Structure

```
dual_backend/
├── docker-compose.yaml         # Service orchestration with health checks
├── routes.json                 # Path→backend mappings for the load balancer
├── README.md                   # Quick start
├── Documentation.md            # This doc
│
├── loadbalancer/               # Express.js load balancer
│   ├── balancer.js
│   ├── Dockerfile
│   └── package.json
│
├── node/                       # Main Node.js backend [Any Framework]
│   ├── index.js
│   ├── Dockerfile
│   └── package.json
│
├── python/                     # Python backend [Any Framework]
│   ├── app.py
│   ├── Dockerfile
│   ├── nodey.py
│   └── requirements.txt
│
├── module/
│   ├── node_bridge/            # Node→Python communication
│   │   ├── nodey.js
│   │   └── package.json
│   └── python_bridge/          # Python→Node communication
│       ├── nodey.py
│       └── Dockerfile
```

---

##  4. API Reference

### 🔁 Bridge: Node → Python

**Base URL**: `http://<node_host>:<NODE_NODEY_PORT>`

| Method | Path  | Payload                             | Description                                 |
|--------|-------|--------------------------------------|---------------------------------------------|
| POST   | `/ask`| `{ "asking_about": "<token>" }`     | Returns base64‑encoded JSON for that token  |

---

### 🔁 Bridge: Python → Node

**Base URL**: `http://<python_host>:<PYTHON_NODEY_PORT>`

| Method | Path  | Payload                             | Description                                 |
|--------|-------|--------------------------------------|---------------------------------------------|
| POST   | `/ask`| `{ "asking_about": "<token>" }`     | Returns base64‑encoded JSON for that token  |

---

##  5. Running the Project

```bash
# Step 1: Clone the repo
git clone <repo_url>
cd nodey

# Step 2: Build & start everything
docker-compose up --build
```

Make sure you have Docker and Docker Compose installed.

---

## Challenges Faced (and Solved)

### 1. **Startup Race Conditions**
- Problem: Services tried to connect before peers were listening → caused 502s and `ECONNREFUSED`.
- Solution: Added health checks and retry logic in bridges.

### 2. **Bridge Blocking**
- Problem: Python bridge tried to reach Node bridge during app startup and got stuck.
- Solution: Moved bridge initialization to separate thread, avoiding blocking Flask server.

### 3. **Resilience**
- Problem: Transient failures broke the load balancer.
- Solution: Retry mechanisms and health probes helped ensure services were reachable before routing began.
---
## Creating an Application using this template
Here is a comprehensive explanation of how to create an application using this template. 

Since it's already mentioned that the request which is sent by the user is first handled by the loadbalancer, a kind of *routing table* must be given to the load balancer for initialization of the proxy routes.

This is done with the help of the ```routes.json``` file, which is at the root of the project.

### -> Example ```routes.json```

```JSON
{
    "routes": [
      {
        "path": "/",
        "method": "get",
        "target": "node",
        "description": "Sends a get request to node runtime at '/' route" 
      },
      {
        "path": "/python",
        "method": "get",
        "target": "python",
        "description": "Send a get request to python runtime at /python"
      },
      {
        "path": "/node",
        "method": "get",
        "target": "node",
        "description": "Send a get request to node runtime at /node"
      },
    ]
  }
```
### Explanation of it
- This file has a key named "routes" whose value is an array which contains objects that define the routes.

- Each object contains keys like "path", "method", "target", and "description" (optional).

- Path refers to the URL at which the loadbalancer will listen and redirect the request. For example, if the above JSON file is used, when a request is received at /node by the load balancer, it will forward the request to the /node endpoint of the node container. This means that the /node route should already be initialized on the node container, and the same applies for Python.

- Method refers to the HTTP method, target is the final destination of the request (either "node" or "python"), and description is for improving human readability, **and is ignored by the load balancer.**

---
The load balancer will initialize its proxy routes according to this JSON file, **without checking if the routes are available on the node and python runtimes.** To minimize errors, routes in routes.json should be added only after the routes are properly handled on individual runtimes.

## 2. Environment Variables
In the root of the project there is an ```.env```
### Example ```.env```

```js
LOADBALANCER_PORT=8000 
# Its the port at which the loadbalancer listnes on

NODE_PORT=3000
# Its the port at which the node container listens on

PYTHON_PORT=5000
# Its the port at which the python container listnes on

NODE_NODEY_PORT=8103
# Its the port which is used by the python container to communicated with node
# There is no need to change it until any "port in use error occures"

PYTHON_NODEY_PORT=1931
# Its the port which is used by the node container to communicated with python
# There is no need to change it until any "port in use error occures"
``` 
## Node and Python Container
For example if you initialize an express and flask application then there are some things which you have to take care of.

### Node
- While defining the port to run the server on, use the environment variable, ```NODE_PORT``` for preventing any misconfiguration.

```Javascript
import express from "express"

let app = express();
const PORT = process.env.NODE_PORT;

app.get("/", (req, res)=>{
  res.send("OK");
});

app.listen(PORT);
```

### Python
- Same goes for python

```Python
 port = int(os.environ.get('PYTHON_PORT', 24224))  # Default 24224 if not set
    if not port:
        print("PYTHON_PORT environment variable is not set!")
        exit(1)

    print(f"Python server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
```
### ***Also make sure to bind to ```0.0.0.0``` for using the docker intranet properly.***

- In python container there is an nodey.py file. For now it must exist there for using the ```PyNodey``` API for intercontainer communication.

## API Refrence.

### NodeyAPI for node
- It helps you to communicate with python container over internal docker intranet.
- The communication happens on a token based system.
- For examples node can ask python about ```Customers_in_db``` and python will reply accordingly.


```JS
import Nodey from './module/node_bridge/nodey.js';

let nodey_node = new Nodey();
// It initialise the routes at which nodey will respond to python

nodey_node.set({
    Customers_in_db:()=>{
        return "this is the data which is to be sent";
    }
});
// If python ask about token Customers_in_db then the function defined under Customers_in_db key will be executed and the value returned will be sent to python

setTimeout(async ()=>{
  console.log(
    await nodey_node.ask("Customers_in_db")
  )
}, 2000);
// This line ask about Customers_in_db token from python after 2000ms

nodey_node.start();
// It will start the server and start handling python 'ask' requests
```
```js
let customers = await nodey_node.ask("Customers_in_db")
// and then the variable customers can be used
```
### NodeyAPI for python
- It helps you to communicate with node container over internal docker intranet.
- The communication happens on a similar token based system only.

```python
from nodey import PyNodey;
from datetime import datetime

pynodey = PyNodey()

formatted_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

pynodey.set({
    "Customers_in_db": lambda: "this is the data from Python",
    "User_count": lambda: 42,
    "Greet": lambda: {"msg": "Hello from Python!"},
    "TIME": lambda: {"Date":formatted_date}
    })
try:
   data_from_node = pynodey.ask("Customers_in_db")  # If "Customers_in_db" is a valid token in Node
   print("Data from Node:", data_from_node)
except Exception as e:
   print("Warning: could not ask Node at startup:", e)

# start the PyNodey bridge in its own thread so it doesn't block the main app
threading.Thread(target=pynodey.start, daemon=True).start() # Its super important otherwise only one of the server, either main server or communication will work and things can break

```

## Future Plans
- It can be converted to an something like IDE and user will not have to deal with docker on its own