import express from 'express';
import fs from 'node:fs';
import path from "node:path"

const app = express();

// ENVIRONMENT VARIABLES
const NODE_PORT = process.env.NODE_PORT;
const PYTHON_PORT = process.env.PYTHON_PORT;
const BALANCER_PORT = process.env.LOADBALANCER_PORT || 8726;

let routes;

// Load Routes from routes.json
const routesPath = path.join(new URL('.', import.meta.url).pathname, 'routes.json');

function loadRoutes(callback) {
    fs.readFile(routesPath, "utf-8", (err, data) => {
        if (err) {
            console.error("Unable to read routes:", err);
            return;
        }
        try {
            const config = JSON.parse(data);
            routes = config.routes;
            callback();
        } catch (e) {
            console.error("Error parsing routes:", e);
        }
    });
}

// Start Balancer
function startBalancer() {
    console.log(`Starting balancer on port ${BALANCER_PORT}`);
    app.listen(BALANCER_PORT, () => {
        console.log(`Server running on port ${BALANCER_PORT}`);
    });
}

function handleRoutes(routes) {
    if (!routes || !Array.isArray(routes)) {
        throw new Error("'routes' must be an array, and also this function must not be used as solely");
    }

    routes.forEach(route => {
        if (!route || !route.path || !route.method || !route.target) {
            throw new Error("Route config is invalid");
        }

        route.target = route.target.trim();
        const method = route.method.toLowerCase();

        let targetUrl = '';
        if (route.target === 'node') {
            targetUrl = process.env.NODE_SERVICE; // e.g., http://120.0.1.1:8080
        } else if (route.target === 'python') {
            targetUrl = process.env.PYTHON_SERVICE; // e.g., http://120.0.0.1:5000
        } else {
            throw new Error(`Invalid route target: ${route.target}`);
        }

        app[method](route.path, async (req, res) => {
            try {
                let response = await fetch(`${targetUrl}${req.url}`, {
                    method: method.toUpperCase(),
                    headers: {
                        'Content-Type': req.headers['content-type'] || 'application/json',
                        // Optionally forward more headers if needed
                    },
                    body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
                        ? JSON.stringify(req.body)
                        : undefined
                });
        
                let data = await response.text();
        
                res.status(response.status);
                res.set('Content-Type', response.headers.get('content-type') || 'text/plain');
                res.send(data);
            } catch (e) {
                console.error('Error fetching:', e);
                res.status(502).send('Bad Gateway');
            }
        });
        
    });
}


// Boot Sequence
function boot() {
    console.log(NODE_PORT, PYTHON_PORT);
    if (!NODE_PORT || !PYTHON_PORT) {
        console.error("NODE_PORT and PYTHON_PORT environment variables are required.");
        process.exit(1);
    }

    loadRoutes(() => {
        handleRoutes(routes);
        startBalancer();
    });
}

boot();
