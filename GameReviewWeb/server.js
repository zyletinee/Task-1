const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

let gamesDict = {};
let usersDict = {};

app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true in production
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await getUserFromDB(id);
    done(null, user);
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

// Route to handle review deletion
app.delete('/delete-review', (req, res) => {
    const { reviewid } = req.body;
    if (!reviewid) {
        return res.status(400).json({ message: 'Review ID is required.' });
    }

    const query = 'DELETE FROM reviews WHERE reviewid = ?';

    db.run(query, [reviewid], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete review.' });
        }

        if (this.changes > 0) {
            res.status(200).json({ message: 'Review deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Review not found.' });
        }
    });
});

app.get('/', (req, res) => {
    res.redirect('/home');
});

// Serve the home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'Home.html'));
});

// About us and contact pages
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'AboutUs.html'));
})

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'ContactUs.html'));
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

app.get('/profile/:userID/:username?', (req, res) => {
    const userID = req.params.userID;

    const query = 'SELECT * FROM users WHERE userid = ?';
    db.get(query, [userID], (err, user) => {
        if (err || !user) {
            return res.redirect('/home'); // Redirect if user not found or error occurs
        }

        const correctUsername = user.username.replace(/ /g, "-").toLowerCase();
        if (!req.params.username || req.params.username.toLowerCase() !== correctUsername) {
            return res.redirect(`/profile/${userID}/${correctUsername}`);
        }

        res.sendFile(path.join(__dirname, 'Public', 'Profile.html'));
    });
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

                const averageRating = Math.round(row.averageRating * 10)/10 || null; // Default to null if no reviews

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

// Endpoint to fetch joined reviews and user data
app.get('/api/joined-reviews/:gameid', (req, res) => {
    const gameId = req.params.gameid;
    const query = `
        SELECT reviews.reviewid, reviews.title, reviews.recommend, reviews.rating, reviews.content, reviews.userid, users.username
        FROM reviews
        JOIN users ON reviews.userid = users.userid
        WHERE reviews.gameid = ?
    `;
    
    db.all(query, [gameId], (err, rows) => {
        if (err) {
            console.error('Error fetching joined reviews:', err.message);
            return res.status(500).json({ error: 'Failed to fetch reviews' });
        }

        // Send the joined reviews and user data as a JSON response
        res.json(rows);
    });
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if user exists
    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error retrieving user" });
        }

        if (!result) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Compare the provided password with the stored hashed password
        const validPassword = await bcrypt.compare(password, result.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Set session and cookie
        req.session.user = { id: result.userid, username: result.username };
        res.cookie("isLoggedIn", true); // Optional cookie to detect login on frontend
        res.send({ message: "Login successful", user: req.session.user });
    });
});

app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if the username already exists
        const queryCheck = 'SELECT * FROM users WHERE username = ?';
        db.get(queryCheck, [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error.' });
            }
            if (user) {
                return res.status(400).json({ error: 'Username already exists.' });
            }

            // Hash the password and insert new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const queryInsert = `INSERT INTO users (username, password) VALUES (?, ?)`;

            db.run(queryInsert, [username, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create user.' });
                }

                // Auto-login the user after successful signup
                req.session.user = { id: this.lastID, username };
                res.status(201).json({ message: 'Signup successful!' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// Logout Route
app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: "Error logging out" });
        }
        res.clearCookie("isLoggedIn");
        res.send({ message: "Logout successful" });
    });
});


// Check Login Status
app.get("/api/status", (req, res) => {
    res.json({
        loggedIn: !!req.session.user,
        userid: req.session.user?.id || null  // Assuming `id` is the user identifier
    });

});

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'Public', 'Assets')); // Directory where the file will be saved
    },
    filename: (req, file, cb) => {
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = req.session.user.id;
        const standardizedFileName = `pfp_${userId}.png`;
        cb(null, standardizedFileName); // Set the file name
    }
});

const upload = multer({ storage });

// Profile picture upload
app.post('/upload-pfp', upload.single('profilePicture'), (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // Save file info to the database (e.g., file.path, userID)
    res.json({ message: 'Profile picture updated successfully' });
});

// Updating bio
async function updateBioInDB(userID, bio) {
    const query = 'UPDATE users SET bio = ? WHERE userid = ?';
    await db.run(query, [bio, userID]); 
}

app.post('/update-bio', async (req, res) => {
    const { bio } = req.body;
    const userID = req.session.user?.id; // Access the userID from the session

    if (!userID || !bio) {
        return res.status(400).json({ message: 'Invalid request data' });
    }

    try {
        await updateBioInDB(userID, bio);
        res.json({ message: 'Bio updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update bio.' });
    }
});


async function updatePasswordInDB(userID, hashedPassword) {
    const query = 'UPDATE users SET password = ? WHERE userid = ?';
    await db.run(query, [hashedPassword, userID]);
}

// Updating password in the database
async function getUserFromDB(userID) {
    const query = 'SELECT * FROM users WHERE userid = ?';
    const row = await db.get(query, [userID]);
    return row;
}

app.post('/update-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userID = req.session.user?.id;

    if (!userID || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Invalid request data' });
    }

    try {
        // Fetch the user from the database
        const query = 'SELECT * FROM users WHERE userid = ?';
        
        // Use db.get for a single row
        const row = await new Promise((resolve, reject) => {
            db.get(query, [userID], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!row) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, row.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        const updateQuery = 'UPDATE users SET password = ? WHERE userid = ?';
        await new Promise((resolve, reject) => {
            db.run(updateQuery, [hashedPassword, userID], (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.json({ message: 'Password updated successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update password.' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    updateAverageScores();
    const query = 'SELECT * FROM users';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error preloading users:', err);
            return;
        }
        rows.forEach(row => {
            usersDict[row.userid] = row; // Populate users dictionary
        });
        console.log('Users preloaded.');
    });
});
