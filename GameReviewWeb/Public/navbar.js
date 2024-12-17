// Global variables
let loggedIn = false;
let loggedID = null;

// Function to check login status
async function checkLogin() {
	try {
		const response = await fetch('/api/status');
		if (!response.ok) throw new Error('Failed to check login status');

		const data = await response.json();
		loggedIn = data.loggedIn;
		loggedID = data.loggedIn ? data.userid : null;
	} catch (error) {
		console.error('Error checking login status:', error);
	}
}

// Function to update the navbar
function updateNavbar() {
	const navRight = document.getElementById("nav-right");
	navRight.innerHTML = ''; // Clear existing buttons

	if (loggedIn) {
		navRight.innerHTML = `
			<button class="profileButton">
				<img src="/Assets/pfp_${loggedID}.png" id="navPfp" alt="Profile Picture"></img>
			</button>
			<div id="navDropdown">
				<a href="/profile/${loggedID}/" class="navbar_buttons">Profile</a>
				<a href="/settings" class="navbar_buttons">Settings</a>
				<button id="logoutButton" class="navbar_buttons" style="background-color: transparent; font-size: 20px">Logout</button>
			</div>
		`;

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

// Search functionality
function initSearch() {
	const searchInput = document.getElementById('search');
	searchInput.addEventListener('keyup', function (event) {
		if (event.key === 'Enter') {
			const query = searchInput.value.trim();
			if (query !== '') {
				window.location.href = `/search?genres=&developers=&publishers=&scores=0%2C5&platforms=&sort=Relevance&search=${encodeURIComponent(query)}`;
			}
		}
	});
}

// Load the navbar dynamically
async function loadNavbar() {
	const navbarContainer = document.getElementById("navbar-container");

	try {
		const response = await fetch("/navbar.html");
		const navbarHTML = await response.text();
		navbarContainer.innerHTML = navbarHTML;

		// Initialize the navbar after loading
		await checkLogin();
		updateNavbar();
		initSearch();
	} catch (error) {
		console.error("Error loading the navbar:", error);
	}
}

document.addEventListener("DOMContentLoaded", loadNavbar);
