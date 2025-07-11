# ⚡ Cross-Runtime Fusion (Go Bridge Between Node.js and Python)

A powerful architecture where Node.js and Python run independently on different ports,
while a Golang-powered Bridge acts as a shared, concurrent function-execution layer between them.

Clients talk to Node.js or Python directly.  
Node and Python talk to each other **via the Go Bridge** using gRPC/HTTP.

───────────────────────────────────────────────

# 📦 INSTALLATION

## Clone this repo
git clone https://github.com/your-username/cross-runtime-fusion
cd cross-runtime-fusion

## Install global CLI (optional)
npm install -g nody

───────────────────────────────────────────────

# 🚀 USAGE

## Initialize the project
nody init

## Run all 3 servers (Node.js, Python, Go bridge)
nody run

## Or start individually
node server.js          # Node.js
python3 server.py       # Python
go run main.go          # Go Bridge

───────────────────────────────────────────────

# 🔧 ARCHITECTURE OVERVIEW

┌────────────┐           ┌────────────┐
│   Node.js  │◄────────┐ │  Python    │
└────┬───────┘         │ └────┬───────┘
     │  Call Python    │      │ Call Node
     │  via Go Bridge  │      │ via Go Bridge
     ▼                 ▼      ▼
              ┌────────────────────┐
              │     Go Bridge      │
              │  (gRPC + HTTP API) │
              └────────────────────┘

- Node.js & Python are independent services
- Both can call functions from the other via the Go Bridge
- Go uses gRPC (for Python) and HTTP (for Node) to route calls
- Go handles concurrency & data marshaling

───────────────────────────────────────────────

# 🔁 FUNCTION CALL EXAMPLES

## In Node.js
let names = await bridge.ask("Customer_names_in_db", {}); 
// This calls Python via Go

## In Python
names = bridge.ask("Customer_names_in_db", {})
# This calls Node via Go

───────────────────────────────────────────────

# 🧠 GO BRIDGE RESPONSIBILITIES

- Accept function name + args
- Route request to correct runtime (Python or Node)
- Handle async/concurrent execution
- Return results to caller runtime

───────────────────────────────────────────────

# ⚙️ TECHNOLOGY STACK

- 🐹  Golang → Central Bridge (gRPC + HTTP + Concurrency)
- 🐍  Python → LLM, ML, analytics
- 🖥  Node.js → Frontend, business logic, database
- 📡  gRPC + REST → Fast, bi-directional communication

───────────────────────────────────────────────

# 🛠 COMING SOON

- JWT security at bridge level
- Pub/sub queue for task dispatch
- LLM microservice runners
- Docker & Kubernetes support

───────────────────────────────────────────────

# 🤝 CONTRIBUTE

Fork, improve, and PR.

───────────────────────────────────────────────

# 👨‍💻 AUTHOR

Anshul Jagota

───────────────────────────────────────────────

# 📄 LICENSE

MIT

───────────────────────────────────────────────
