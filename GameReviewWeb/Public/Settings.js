// Declare global variables
let loggedIn = false;
let loggedID = null;
// Function to check login status
async function checkLogin() {
    try {
        const response = await fetch('/api/status');
        if (!response.ok) {
            throw new Error('Failed to check login status');
        }
        const data = await response.json();
        console.log('Login status:', data); // Debugging line
        loggedIn = data.loggedIn;
        loggedID = data.userid;
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}


async function initialize() {
    await checkLogin();
    updateNavbar();
}

// Call the function to initialize global variables and update navbar
window.addEventListener('DOMContentLoaded', initialize);


//navbar
// Function to update the navbar
function updateNavbar() {
	const navRight = document.getElementById("nav-right");
	navRight.innerHTML = ''; // Clear existing buttons

	if (loggedIn) {
		navRight.innerHTML = `
			<button class="profileButton">
				<img id="navPfp" alt="Profile Picture"></img>
			</button>
			<div id="navDropdown">
				<a href="/profile/${loggedID}" class="navbar_buttons">Profile</a>
				<a href="/settings" class="navbar_buttons">Settings</a>
				<button id="logoutButton" class="navbar_buttons" style="background-color: transparent; font-size: 20px">Logout</button>
			</div>
		`;
        const navPFP = document.getElementById("navPfp");
        const profilePicUrl = `/Assets/pfp_${loggedID}.png`;

        // Check if the profile picture exists
        fetch(profilePicUrl, { method: "HEAD" })
            .then((response) => {
                navPFP.src = response.ok ? profilePicUrl : "/Assets/Default-PFP.png";
            })
            .catch(() => {
                navPFP.src = "/Assets/Default-PFP.png";
            });
		const logoutButton = document.getElementById("logoutButton");
		logoutButton.addEventListener('click', async (e) => {
			e.preventDefault();

			try {
				const response = await fetch('/logout', { method: 'POST' });
				if (response.ok) {
					alert('Logout successful!');
					window.location.href = '/';
				} else {
					alert('Failed to log out.');
				}
			} catch (error) {
				console.error('Error logging out:', error);
				alert('An error occurred while logging out.');
			}
		});
	} else {
		navRight.innerHTML = `
			<a href="/Login" class="navbar_buttons">Login</a>
			<a href="/signup" class="navbar_buttons">Signup</a>
		`;
	}
}

// previewing pfp function
document.getElementById('uploadPfp').addEventListener('change', function(event) {
    const preview = document.getElementById('pfpPreview');
    const file = event.target.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

document.getElementById("pfpForm").addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const profilePicture = formData.get('profilePicture');

    if (!profilePicture) {
        alert('Please select a profile picture.');
        return;
    }

    if (!profilePicture.type.startsWith('image/png')) {
        alert('Please select a PNG image.');
        return;
    }

    try {
        const response = await fetch('/upload-pfp', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload profile picture');
        }

        const data = await response.json();
        alert(data.message);
        window.location.href = `/profile/${loggedID}`;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('An error occurred while uploading the profile picture.');
    }
});

document.getElementById("passwordForm").addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');

    if (!oldPassword || !newPassword) {
        alert('Please enter both old and new passwords.');
        return;
    }

    try {
        const response = await fetch('/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oldPassword: oldPassword,
                newPassword: newPassword,
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update password');
        }

        const data = await response.json();
        alert(data.message);
        window.location.href = `/profile/${loggedID}`;
    } catch (error) {
        console.error('Error updating password:', error);
        alert('An error occurred while updating your password.');
    }
});

// changing bio function
document.querySelector('#bioForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const bioText = document.getElementById('bioButton').value;
    const response = await fetch('/update-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            bio: bioText,
        })
    });
    const result = await response.json();
    alert(result.message);
    window.location.href = `/profile/${loggedID}`;
});
