const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

let gamesDict = {};

// Serve static files from the "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Home.html'));
});

// Serve the search page
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'search.html'));
});

// Handle game page requests
app.get('/game/:gameID/:gameName?', (req, res) => {
    const gameID = req.params.gameID;
    const game = gamesDict[gameID];

    if (game) {
        // Redirect to the correct game URL if gameName is missing or incorrect
        const correctGameName = game.name.replace(/ /g, "-");
        if (!req.params.gameName || req.params.gameName.toLowerCase() !== correctGameName.toLowerCase()) {
            res.redirect(`/game/${gameID}/${correctGameName}`);
        } else {
            res.sendFile(path.join(__dirname, 'Public', 'GamePage.html'));
        }
    } else {
        res.redirect('/search');
    }
});

// Database path
const dbPath = path.join(__dirname, 'Databases', 'grn.db');

// Endpoint to fetch API results and populate the dictionary
app.get('/api/gameresults', (req, res) => {
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
            rows.forEach((row) => {
                gamesDict[row.id] = row;
            });
            res.json(rows);
        }
        db.close();
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
