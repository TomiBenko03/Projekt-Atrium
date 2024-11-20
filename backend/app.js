const express = require('express');
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Example route
app.get('/api', (req, res) => {
    res.json({ message: "Hello from the server!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
