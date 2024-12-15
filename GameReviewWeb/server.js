const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

let gamesDict = {};

// Serve static files from the "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

// Middleware to parse JSON body
app.use(express.json());

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Home.html'));
});

// Serve the search page
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'search.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Login.html'));
});

// Serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'SignUp.html'));
});

// Serve the settings page
app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Settings.html'));
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

// Initialize database connection globally
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Endpoint to fetch API results and populate the dictionary
app.get('/api/gameresults', (req, res) => {
    const query = 'SELECT * FROM game';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching game data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        rows.forEach((row) => {
            gamesDict[row.id] = row; // Populate games dictionary
        });

        res.json(rows); // Send game data as JSON
    });
});

// Handle review submissions
app.post('/submit-review', (req, res) => {
    const { title, recommend, rating, content, userid, gameid } = req.body;

    // Validate input
    if (!title || recommend === undefined || !rating || !content || !userid || !gameid) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Insert data into the `reviews` table
    const query = `
        INSERT INTO reviews (title, recommend, rating, content, userid, gameid)
        VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [title, recommend, rating, content, userid, gameid], function (err) {
        if (err) {
            console.error('Error inserting review data:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        res.status(200).json({
            message: 'Review submitted successfully!',
            reviewId: this.lastID // Return the newly inserted review ID
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
