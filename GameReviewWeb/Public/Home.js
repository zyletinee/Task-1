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

        // Update global variables
        loggedIn = data.loggedIn;
        loggedID = data.loggedIn ? data.userid : null;
    } catch (error) {
        console.error('Error checking login status:', error);
    }
}

async function initialize() {
    await checkLogin();
    updateNavbar();
}

// Call the function to initialize global variables and update navbar
initialize();

//navbar
function updateNavbar() {
  const navRight = document.getElementById("navDropdown")
  navRight.innerHTML = ''; // Clear existing buttons

  if (loggedIn) {
    // Show Profile and Settings buttons
    navRight.innerHTML = `
      <a href="/profile/${loggedID}" class="navbar_buttons">Profile</a>
      <a href="/settings" class="navbar_buttons">Settings</a>
    `;
    console.log("loggedinnav")
  } else {
    // Show Login and Signup buttons
    navRight.innerHTML = `
      <a href="/Login" class="navbar_buttons">Login</a>
      <a href="/signup"class="navbar_buttons">Signup</a>
    `;
    console.log("loggedoutnav")
  }
}


// search
	var searchInput = document.getElementById('search');

	// Add event listener for keyup event
	searchInput.addEventListener('keyup', function(event) {
		// Check if the Enter key is pressed
		if (event.key === 'Enter') {
			// Get the search query
			var query = searchInput.value.trim();

			// Check if the query is not empty
			if (query !== '') {
				// Redirect to the search page with the query parameter
				window.location.href = '/search?genres=&developers=&publishers=&scores=0%2C5&platforms=&sort=Relevance&search=' + encodeURIComponent(query);
			}
		}
	});

// img slider
	var imgs = document.querySelectorAll('.slider img');
	var dots = document.querySelectorAll('.dot');	
	var link = document.getElementById('slider-link');
	var currentImg = 0; // index of the first image 
	const interval = 5000; // duration(speed) of the slide
	var timer = setInterval(changeSlide, interval);	

	const links = [
		"/search", 
		"/game/$26/", 
		"https://www.pcgamer.com/games/action/the-yakuza-studio-is-making-a-new-action-game-set-in-1915-japan/"
	];

	link.href = links[currentImg];

	function changeSlide(n) {
		for (var i = 0; i < imgs.length; i++) { // reset
			imgs[i].style.opacity = 0; // makes inactive images invisible
			dots[i].className = dots[i].className.replace(' active', '');
		}

		currentImg = (currentImg + 1) % imgs.length; // update the index number

		if (n != undefined) { // if a button is clicked
			clearInterval(timer);
			timer = setInterval(changeSlide, interval);
			currentImg = n;
	}

		imgs[currentImg].style.opacity = 1;
		dots[currentImg].className += ' active';
		link.href = links[currentImg];
	}

