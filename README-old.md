# Nodey
## Core Ideas
- I want two runtimes running simultaneously.
- Some of the routes are handled by python others are by node.
- Some way to share data between them
- Some way to import function from python to node and vice-versa

## How it will function.
- There will be a load balancer which will divert some of the request to node and other to the python.
- The respective runtimes will do there work and return the output to the load balancer which will then be sent to the client.