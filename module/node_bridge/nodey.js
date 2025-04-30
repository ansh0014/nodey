import express from "express";
// import fetch from "node-fetch";

let app = express();

// Middleware to parse JSON
app.use(express.json());

let python_port = process.env.PYTHON_NODEY_PORT;

// app.post("/ask", async (req, res)=>{
//     let json = req.body();
//     json = json.asking_about;
//     try{
//         let response = await fetch("http://python:"+python_port+"/ask-python", {
//             method:"POST", 
//             body:JSON.stringify({asking_about:json})
//         });
//         let json = response.json();
//         res.send(json.data);
//     }
//     catch(e){
//         res.send(e);
//     }
// });

// app.post("/ask-node", (req, res)=>{
//     let json = req.body();
// });


export default class Nodey{
    constructor(){
        let port=process.env.NODE_NODEY_PORT;
        this.port = port;
        if (!port){
            throw new Error("Nodey reqires ports to run its bridge between python and node. No ports were given to run on.");
        }
        app.get("/", (req, res)=>{
            res.send("OK");
        });

        app.post("/", (req, res)=>{
            res.send("OK");
        });

        app.get('/health', (_req, res) => res.sendStatus(204));

        app.post("/ask", (req, res)=>{
            // console.log(req.body);
            let json = req.body;
            let token  = json.asking_about;
            // {"asking_about":"token"}
            let toSend;
            try{
            toSend = this.shareObject[token]();
            }
            catch(e){
                console.log(e);
                res.send(e);
            }
            let object_to_send = { data: Buffer.from(JSON.stringify(toSend)).toString('base64') };
            res.json(object_to_send);
        });
    }
    async ask(token){
        if (!token){
            throw new Error("Token is required to get data from python.");
        }
        const retries = 5;
        const delay = 2000; // milliseconds
        for (let i = 0; i < retries; i++) {
            try {
                // attempt fetch
                let response = await fetch("http://python:" + python_port + "/ask", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ asking_about: token })
                });
                let jsonResp = await response.json();
                let data = jsonResp.data;
                return Buffer.from(data, 'base64').toString();
            } catch (e) {
                if (i === retries - 1) {
                    throw new Error(`Nodey ask failed after ${retries} attempts: ${e}`);
                }
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
    set(shareObject){
        if(typeof shareObject!="object"){throw new Error("set() received bad arguments")}

        this.shareObject = shareObject;
        // {Custom_names_in_db:()=>{
        //  
        // }}
    }
    start(){
        app.listen(this.port, '0.0.0.0', () => {
            console.log(`Listening on port ${this.port}`);
        });
        
    }
}