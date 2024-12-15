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
const reviewProfile = document.getElementById("reviewProfilePicLink");
const reviewProfileImg = document.getElementById("reviewProfilePic");

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
        // Fetch reviews from the API endpoint
        const response = await fetch(`/api/gamereviews/${gameId}`);
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }

        const responseUser = await fetch(`/api/users`);
        if (!responseUser.ok) {
            throw new Error('Failed to load user');
        }

        const reviews = await response.json();
        const users = await responseUser.json();

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
            const user = users.find(user => user.userid === parseInt(review.userid));

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
            thumbnailLink.href = `/profile/${user.userid}/${user.username}`; // Replace with actual link if needed
            const thumbnailImage = document.createElement('img');
            thumbnailImage.classList.add('pfp');
            thumbnailImage.src = `/Assets/pfp_${user.userid}.png` // Replace with profile picture later
            thumbnailImage.alt = 'User Profile Picture';
            const username = document.createElement("h1");
            username.id = "reviewUsernameText"
            username.innerText = user.username
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
            recommendText.textContent = `Recommended: ${review.recommend === '1' ? 'Yes' : 'No'}`; // Recommend status
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
        const userid = 1; // Replace with actual user ID
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

// Get the search input field
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

loadGamePage()
