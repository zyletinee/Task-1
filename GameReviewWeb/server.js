const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

let gamesDict = {};
let usersDict = {};

// Serve static files from the "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

// Middleware to parse JSON body
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/home');
});

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

//Handle profile page requests
app.get('/profile/:userID/:username?', (req, res) => {
    const userID = req.params.userID;
    const user = usersDict[userID];

    if (user) {
        // Redirect to the correct profile URL if username is missing or incorrect
        const correctUsername = user.username.replace(/ /g, "-");
        if (!req.params.username || req.params.username.toLowerCase()!== correctUsername.toLowerCase()) {
            res.redirect(`/profile/${userID}/${correctUsername}`);
        } else {
            res.sendFile(path.join(__dirname, 'Public', 'Profile.html'));
        }
    } else {
        res.redirect('/home');
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

app.get('/api/gamereviews/:gameid', (req, res) => {
    const gameId = req.params.gameid;
    const query = 'SELECT * FROM reviews WHERE gameid = ?';
    // Execute the query
    db.all(query, [gameId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch reviews' });
        }
        
        // Send the reviews as a JSON response
        res.json(rows);
    });

})

app.get('/api/userreviews/:userid', (req, res) => {
    const userId = req.params.userid;
    const query = 'SELECT * FROM reviews WHERE userid = ?';
    // Execute the query
    db.all(query, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch user reviews' });
        }
        // Send the user's reviews as a JSON response
        res.json(rows);
    });
})

app.get('/api/users' , (req, res) => {
    const query = 'SELECT * FROM users';
    // Execute the query
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
        rows.forEach((row) => {
            usersDict[row.userid] = row; // Populate games dictionary
        });
        // Send the user's details as a JSON response
        res.json(rows);
    });
})

// Function to calculate and update average scores for all games
function updateAverageScores() {
    // Query to get all game IDs
    const getGamesQuery = 'SELECT id FROM game';

    db.all(getGamesQuery, [], (err, rows) => {
        if (err) {
            console.error('Error fetching games:', err);
            return;
        }

        // For each game, calculate the average score
        rows.forEach((game) => {
            const gameId = game.id;

            // SQL query to get the average rating for each game
            const getAvgRatingQuery = 'SELECT AVG(rating) AS averageRating FROM reviews WHERE gameid = ?';

            db.get(getAvgRatingQuery, [gameId], (err, row) => {
                if (err) {
                    console.error('Error calculating average rating for game', gameId, err);
                    return;
                }

                const averageRating = row.averageRating || null; // Default to null if no reviews

                // SQL query to update the average score in the "game" table
                const updateQuery = 'UPDATE game SET averagescore = ? WHERE id = ?';

                db.run(updateQuery, [averageRating, gameId], function (err) {
                    if (err) {
                        console.error('Error updating average score for game', gameId, err);
                }});
            });
        });
    });
}


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

        updateAverageScores();
        // Return the reviewId (auto-generated by SQLite)
        res.status(200).json({
            message: 'Review submitted successfully!',
            reviewId: this.lastID // This will be the newly generated review ID
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    updateAverageScores();
});
