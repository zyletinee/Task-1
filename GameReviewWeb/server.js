const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

// Serve the search.html file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'search.html'));
});

// Database path
const dbPath = path.join(__dirname, 'Databases', 'grn.db');

// Endpoint to fetch search results
app.get('/api/results', (req, res) => {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to connect to database' });
        }
    });

    const query = 'SELECT * FROM game';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to fetch data' });
        } else {
            res.json(rows);
        }
        db.close();
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
