import express from 'express';

export const app = express();

// here is all the bread and the butter that comes in

app.get('/node', (req, res) => {
    // res.sendStatus(500);
    res.send('<H1>hoelaSSaa node</H1>');
});

app.get('/', (req, res) => {
    // res.sendStatus(500);
    res.send('<H1>hoelaSSaa</H1>');
});

app.get('/baltej', (req, res) => {
    // res.sendStatus(500);
    res.send('<H1>hoelaSSaa</H1>');
});

const PORT = process.env.NODE_PORT || 19131;

if (!PORT) {
    console.error("NODE_PORT environment variable is not set!");
    process.exit(1);
}

console.log(`Node server starting on port ${PORT}`);

app.listen(PORT, () => {
    console.log(`Node Server running on port ${PORT}`);
});
