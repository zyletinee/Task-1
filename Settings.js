// front end

// previewing pfp function
document.getElementById('uploadPfp').addEventListener('change', function(event) {
    const preview = document.getElementById('pfpPreview');
    const file = event.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// changing bio function
document.querySelector('#bioForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const bioText = document.getElementById('bioButton').value;
    const response = await fetch('/update-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioText })
    });
    const result = await response.json();
    alert(result.message);
});

// back end 

// using multer api to upload and save pfp
const multer = require('multer');
const upload = multer({ dest: 'Databases/' }); // Set upload folder
const bcrypt = require('bcrypt');

app.post('/upload-pfp', upload.single('profilePicture'), (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    // save file info to the database (e.g., file.path, userID)
    res.json({ message: 'Profile picture updated successfully' });
});

// updating bio
async function updateBioInDB(userID, bio) {
    const query = 'UPDATE users SET bio = ? WHERE userid = ?';
    await db.execute(query, [bio, userID]); 
}

app.post('/update-bio', async (req, res) => {
    const { bio } = req.body;
    const userID = req.user.id;
    // update the bio in the database
    try {
        await updateBioInDB(userID, bio);
        res.json({ message: 'Bio updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update bio.' });
    }
});

// updating password in db

async function getUserFromDB(userID) {
    const query = 'SELECT * FROM users WHERE userid = ?';
    const [rows] = await db.execute(query, [userID]);
    return rows[0]; // return the user's row
}

async function updatePasswordInDB(userID, hashedPassword) {
    const query = 'UPDATE users SET password = ? WHERE userid = ?';
    await db.execute(query, [hashedPassword, userID]);
}

app.post('/update-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userID = getUserFromDB(userID)

    try {
        const user = await getUserFromDB(userID);

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        await updatePasswordInDB(userID, hashedPassword);

        res.json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update password.' });
    }
});