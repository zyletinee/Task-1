const platformIDs = {
    0: "Windows",
    1: "Mac",
    2: "Linux",
    3: "Android",
    4: "IOS",
    5: "PSX",
    6: "PS2",
    7: "PS3",
    8: "PS4",
    9: "PS5",
    10: "PSP",
    11: "PS_Vita",
    12: "Xbox",
    13: "Xbox_360",
    14: "Xbox_One",
    15: "Xbox_Series_SX",
    16: "NES",
    17: "SNES",
    18: "N64",
    19: "GameCube",
    20: "Wii",
    21: "Wii_U",
    22: "Game_Boy",
    23: "Game_Boy_Colour",
    24: "GBA",
    25: "DS",
    26: "3DS",
    27: "Switch",
    28: "Sega_Mega_Drive",
    29: "Sega_Dreamcast"
};

const genreIDs = {
    1: "Action",
    2: "Shooter",
    3: "Adventure",
    4: "Casual",
    5: "Puzzle",
    6: "RPG",
    7: "Simulation",
    8: "Sports",
    9: "Racing",
    10: "Strategy",
    11: "Rhythm",
    12: "Social"
};

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

function goBack() {
    window.location.href = '/search?genres=&developers=&scores=0%2C5&platforms=&sort=Relevance&search=';
};

const title = document.getElementById("gametitle");
const description = document.getElementById("descriptionText");
const ratingLink = document.getElementById("ratingLink");
const devLink = document.getElementById("devLink");
const pubLink = document.getElementById("pubLink");
const genres = document.getElementById("genre");
const platforms = document.getElementById("platforms");
const release = document.getElementById("releaseDate");
const cover = document.getElementById("coverArt");
const writeReview = document.getElementById("writeReview");
const reviewProfile = document.getElementById("reviewProfileLink");
const reviewProfileImg = document.getElementById("reviewProfilePic");
const reviewContainer = document.getElementById("reviewFormContainer");

function generateLink(query, categ) {
    const searchParams = new URLSearchParams();
    const parameters = {
        "genre" : '',
        "developer" : '',
        "publisher" : '',
        "platforms" : ''
    }
    parameters[categ] = query
    searchParams.append('genres', parameters['genre']);
    searchParams.append('developers', parameters['developer']);
    searchParams.append('publishers', parameters['publisher'])
    searchParams.append('scores', '0,5');
    searchParams.append('platforms', parameters['platforms']);
    searchParams.append('sort', 'Relevance');
    searchParams.append('search', '');
    return `/search?${searchParams.toString()}`;
}

function styleDate(date) {
    const arr = date.split('');
    const year = arr.slice(0, 4).join("");
    const month = arr.slice(4, 6).join("");
    const day = arr.slice(6, 8).join("");
    return `${day}/${month}/${year}`;
}

async function loadGamePage() {
    const pathArray = window.location.pathname.split('/');
    const gameID = pathArray[2]
    const gameName = pathArray[3].replace(/-/g, " ");
    const response = await fetch("/api/gameresults");
    const games = await response.json();
    const game = games[gameID-1];
    const tabtitle = document.getElementById("tabtitle");
    
    tabtitle.textContent = `${gameName} - Game Reviews Now!`
    ratingLink.innerText = `${game.averagescore}/5`;
    writeReview.innerText = `Write a Review for ${gameName}`
    devLink.innerText = game.developer
    devLink.href = generateLink(game.developer, "developer")
    pubLink.innerText = game.publisher;
    pubLink.href = generateLink(game.publisher, "publisher")
    title.innerText = gameName;
    cover.src = `/Assets/cvimg_${gameID}.png`;
    release.textContent = styleDate(game["release date"].toString());
    genreArray = game.genres.split(' ');
    platArray = game.platforms.split(' ');
    description.innerText = game.description;
    if (loggedIn) {
        reviewProfile.href = `/profile/${loggedID}`;
        const profilePicUrl = `/Assets/pfp_${loggedID}.png`;

        // Check if the profile picture exists
        fetch(profilePicUrl, { method: "HEAD" })
            .then((response) => {
                reviewProfileImg.src = response.ok ? profilePicUrl : "/Assets/Default-PFP.png";
            })
            .catch(() => {
                reviewProfile.src = "/Assets/Default-PFP.png";
            });
    } else {
        reviewContainer.innerHTML = `
            <p style="font-size: 20px;">
                You are not logged in. Please &nbsp;
                <a href="/login">login</a>&nbsp;
                or &nbsp;
                <a href="/signup">create an account</a>&nbsp;
                to make a review.
            </p>
        `
    }
    

    genreArray.forEach((element, index) => {
        const newLink = document.createElement("a");
        newLink.href = generateLink(genreIDs[element], "genre");
        newLink.innerText = genreIDs[element];
        genres.appendChild(newLink);
    
        // Add a comma and a space, except after the last link
        if (index < genreArray.length - 1) {
            genres.appendChild(document.createTextNode(", "));
        }
    });
    
    platArray.forEach((element, index) => {
        const newLink = document.createElement("a");
        newLink.href = generateLink(platformIDs[element], "platforms");
        newLink.innerText = platformIDs[element].replace(/_/g, " ");
        platforms.appendChild(newLink);
    
        // Add a comma and a space, except after the last link
        if (index < platArray.length - 1) {
            platforms.appendChild(document.createTextNode(", "));
        }
    });
    loadReviews(gameID)
}

async function loadReviews(gameId) {
    try {
        // Fetch reviews with user data from the API endpoint
        const response = await fetch(`/api/joined-reviews/${gameId}`);
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }

        const reviews = await response.json();

        // Get the review list container
        const reviewList = document.getElementById('reviewList');
        // Clear the existing reviews (if any)
        reviewList.innerHTML = '';

        if (reviews.length === 0) {
            const noReviewsDiv = document.createElement('div');
            noReviewsDiv.classList.add('reviewItem');
            const noReviewsText = document.createElement('h1');
            noReviewsText.style.margin = "auto";
            noReviewsText.style.padding = "20px";
            noReviewsText.textContent = "This game has no reviews. Be the first to make a review!";
            noReviewsDiv.appendChild(noReviewsText);
            reviewList.appendChild(noReviewsDiv);
        }
        // Loop through the reviews and create the HTML dynamically
        reviews.forEach(review => {
            // Create the list item <li>
            const li = document.createElement('li');
            li.classList.add('reviewItem');
            li.id = `item${review.reviewid}`; // Assuming the review object has an id field

            // Create the review item container
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('reviewItem');
            reviewItem.id = `reviewItem${review.reviewid}`;

            // Create the thumbnail container
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.classList.add('avatarItem');
            const thumbnailLink = document.createElement('a');
            thumbnailLink.href = `/profile/${review.userid}/${review.username}`; // Use user data from the review
            const thumbnailImage = document.createElement('img');
            thumbnailImage.classList.add('pfp');
            const profilePicUrl = `/Assets/pfp_${review.userid}.png`;

            fetch(profilePicUrl, { method: 'HEAD' })
                .then(response => {
                    thumbnailImage.src = response.ok ? profilePicUrl : '/Assets/Default-PFP.png';
                })
                .catch(() => {
                    thumbnailImage.src = '/Assets/Default-PFP.png';
                });

            thumbnailImage.alt = 'User Profile Picture';
            const username = document.createElement("h1");
            username.id = "reviewUsernameText";
            username.innerText = review.username; // Use user data from the review
            thumbnailLink.appendChild(thumbnailImage);
            thumbnailLink.appendChild(username);
            thumbnailContainer.appendChild(thumbnailLink);


            // Create the review info container
            const reviewInfoContainer = document.createElement('div');
            reviewInfoContainer.classList.add('reviewInfoContainer');


            // Create the title container
            const reviewTitleContainer = document.createElement('div');
            reviewTitleContainer.classList.add('reviewTitleContainer');
            const reviewTitle = document.createElement('h1');
            reviewTitle.classList.add('reviewInfoText');
            reviewTitle.textContent = review.title; // Review title
            reviewTitleContainer.appendChild(reviewTitle);

            // Create the delete button if logged in user made the review
            if (loggedIn && review.userid === loggedID) {
                // Create the delete button
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('deleteReview');
                deleteButton.textContent = 'Delete';

                // Add an event listener to handle deletion
                deleteButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch('/delete-review', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ reviewid: review.reviewid })
                        });

                        const result = await response.json(); // Parse JSON response

                        if (response.ok) {
                            alert(result.message);
                            reviewList.removeChild(li); // Remove the review from the list
                            window.location.reload();
                        } else {
                            alert(result.message || 'Failed to delete review.');
                        }
                    } catch (error) {
                        console.error('Error deleting review:', error);
                        alert('An error occurred while deleting the review.');
                    }
                });

                // Append the delete button to the review item
                reviewTitleContainer.appendChild(deleteButton);
            }


            // Create the rating container
            const reviewRatingContainer = document.createElement('div');
            reviewRatingContainer.classList.add('reviewRatingContainer');
            const reviewRating = document.createElement('div');
            reviewRating.classList.add('reviewRating');
            const reviewScore = document.createElement('h2');
            reviewScore.classList.add('reviewInfoText');
            reviewScore.textContent = `Score: ${review.rating}/5`; // Review score
            reviewRating.appendChild(reviewScore);
            reviewRatingContainer.appendChild(reviewRating);

            // Create the recommend container
            const reviewRecommend = document.createElement('div');
            reviewRecommend.classList.add('reviewRecommend');
            const recommendText = document.createElement('h2');
            recommendText.classList.add('reviewInfoText');
            recommendText.textContent = `Recommended: ${review.recommend == 1 ? 'Yes' : 'No'}`; // Recommend status
            reviewRecommend.appendChild(recommendText);
            reviewRatingContainer.appendChild(reviewRecommend);

            // Create the review body container
            const reviewBodyContainer = document.createElement('div');
            reviewBodyContainer.classList.add('reviewBodyContainer');
            const reviewBody = document.createElement('p');
            reviewBody.classList.add('reviewInfoText');
            reviewBody.textContent = review.content; // Review body content
            reviewBodyContainer.appendChild(reviewBody);

            // Append the created elements to the reviewInfoContainer
            reviewInfoContainer.appendChild(reviewTitleContainer);
            reviewInfoContainer.appendChild(reviewBodyContainer);
            reviewInfoContainer.appendChild(reviewRatingContainer);

            // Append the reviewInfoContainer and thumbnailContainer to the reviewItem
            reviewItem.appendChild(thumbnailContainer);
            reviewItem.appendChild(reviewInfoContainer);

            // Append the reviewItem to the <li> element
            li.appendChild(reviewItem);

            // Append the <li> to the review list
            reviewList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Select all the radio buttons and their labels
const radioButtons = document.querySelectorAll('input[name="recommend"]');
const labels = document.querySelectorAll('.recommendButton');

// Function to update button styles
function updateStyles() {
    // Reset styles for all labels
    labels.forEach(label => {
        label.style.backgroundColor = "#f0f0f0";
        label.style.color = "black";
    });

    // Apply styles to the selected button
    const selected = document.querySelector('input[name="recommend"]:checked');
    if (selected) {
        const selectedLabel = document.querySelector(`label[for="${selected.id}"]`);
        selectedLabel.style.backgroundColor = "#4CAF50";
        selectedLabel.style.color = "white";
    }
}

// Attach event listeners to radio buttons
radioButtons.forEach(radio => {
    radio.addEventListener('change', updateStyles);
});

const form = document.getElementById('reviewForm');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        // Gather input values
        const title = document.getElementById('title').value;
        const review = document.getElementById('body').value;
        const rating = document.getElementById('rating').value;
        const recommend = document.querySelector('input[name="recommend"]:checked')?.value;

        // Example hardcoded values for userid and gameid
        const userid = loggedID;
        const pathArray = window.location.pathname.split('/');
        const gameid = pathArray[2];

        // Validate input
        if (!recommend) {
            throw new Error('Please select if you recommend the game or not.');
        }

        // Send data to the server
        const response = await fetch('/submit-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                recommend: parseInt(recommend),
                rating: parseInt(rating),
                content: review,
                userid,
                gameid,
            }),
        });

        // Check response status
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to submit review: ${errorData.message}`);
        }

        // Success handling
        const result = await response.json();
        alert('Review submitted successfully!');
        location.reload();
    } catch (error) {
        // Display error message to the user
        alert(`Error: ${error.message}`);
        console.error('Error details:', error);
    }
});

const searchInput = document.getElementById('search');
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query !== '') {
            window.location.href = `/search?genres=&developers=&publishers=&scores=0%2C5&platforms=&sort=Relevance&search=${encodeURIComponent(query)}`;
        }
    }
});

loadGamePage()
