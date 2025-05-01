import express from 'express';
import Nodey from './module/node_bridge/nodey.js';
export const app = express();

// here is all the bread and the butter that comes in

app.get('/node', (req, res) => {
    // res.sendStatus(500);
    res.send('<H1>Hello node</H1>');
});

app.get('/', (req, res) => {
    // res.sendStatus(500);
    res.send('<H1>Hello</H1>');
});

const PORT = process.env.NODE_PORT || 19131;

if (!PORT) {
    console.error("NODE_PORT environment variable is not set!");
    process.exit(1);
}

console.log(`Node server starting on port ${PORT}`);

// let nodey_node_server = new Nodey();

// nodey_node_server.set({
//     Customers_in_db:()=>{
//         return "this is the data which is to be sent";
//     }
// });

// setTimeout(async ()=>{console.log(await nodey_node_server.ask("Customers_in_db"));}, 2000);

// nodey_node_server.start();


// app.get("/askfrompython", async(req, res)=>{
//     res.send(
//         await nodey_node_server.ask("TIME")
//     );
// });

app.listen(PORT, () => {
    console.log(`Node Server running on port ${PORT}`);
});
