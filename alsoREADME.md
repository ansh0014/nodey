# Cross runtime fusion

## Core Ideas
- I want two runtimes running simultaneously.
- Some of the routes are handled by python others are by node. So I need to set up some kind of load balancer which is configured and knows which route is to be handled by python and which by node.
- Some way to share data between them. Like if I am calling a function of python from node, then I must be able to send data to that function and also I can fetch some data from node in python and viceversa.
- Some way to import function from python to node and vice-versa. So Need some kind of middleware bridge which under the hood runs that function with the given input.

## How it will function.
- There will be a load balancer which will divert some of the request to node and other to the python. So basically the load balancer will be a server which will first handle the request [so the 2nd core idea can be implemented]
- The node and python will be running on diffrent ports so the load balancer will contact them through http requests.
- The respective runtimes will do there work and return the output to the load balancer which then will  return the responce to the client.
- There will be a websocket/HTTP connection between node and python using which they can communicate. [3rd core ideas implementation]

```JS
// for example there can be a function like
let cutomerNames = python.ask("Customer_names_in_db"); // returns object with customer names.
```
and there can be similar function in node too.

```py
# For example:
customerName = node.ask("Customer_names_in_db") # returns object with customer names.
```

- So there will actually be 3 running servers, fist being the load balancer/Reverse proxy and the other two being the node and python each of them configured to run at diffrent ports like load balacer on 80/443, the node to some port like 19131 [example] and the python of some like 24224 [Example] 

## Load balancer
- The easiest way to write load balancer is to pick a language, for example JS, write it in express and reroute the requests to the node and python.
- I am more okay with JS so i will write it in JS
- Am Done with load balancer, I stated this project yesterday.
