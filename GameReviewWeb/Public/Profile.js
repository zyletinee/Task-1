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

function styleDate(date) {
    const arr = date.split('');
    const year = arr.slice(0, 4).join("");
    const month = arr.slice(4, 6).join("");
    const day = arr.slice(6, 8).join("");
    return `${day}/${month}/${year}`;
}

const profilePic = document.getElementById("userPfp")
const uname = document.getElementById("usernameText")
const userBio = document.getElementById("bioContents")
const bioTitle = document.getElementById("bioTitle")
const pReviewTitle = document.getElementById("personalReviewTitle")

async function loadUserPage() {
    const pathArray = window.location.pathname.split('/');
    const userID = pathArray[2]
    const username = pathArray[3].replace(/-/g, " ");
    const response = await fetch(`/api/users`);
    const users = await response.json();
    const user = users[userID-1];

    // Set the profile picture, username, and bio
    profilePic.src = `/Assets/pfp_${userID}.png`
    uname.textContent = username;
    userBio.textContent = user.bio;
    bioTitle.textContent = `About ${username}`;
    pReviewTitle.textContent = `Reviews by ${username}`

    loadReviews(userID)
}

async function loadReviews(userID) {
    try {
        // Fetch reviews from the API endpoint
        const response = await fetch(`/api/userreviews/${userID}`);
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }
        const reviews = await response.json();

        // Get the review list container
        const reviewList = document.getElementById('userReviewList');
        // Clear the existing reviews (if any)
        reviewList.innerHTML = '';

        if (reviews.length === 0) {
            const noReviewsDiv = document.createElement('div');
            noReviewsDiv.classList.add('reviewItem');
            const noReviewsText = document.createElement('h1');
            noReviewsText.style.margin = "auto";
            noReviewsText.style.padding = "20px";
            noReviewsText.textContent = "This user has not made any reviews.";
            noReviewsDiv.appendChild(noReviewsText);
            reviewList.appendChild(noReviewsDiv);
        }
        // Loop through the reviews and create the HTML dynamically
        reviews.forEach(review => {
            const game = review.gameid

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
            thumbnailContainer.classList.add('thumbnailContainer');
            const thumbnailLink = document.createElement('a');
            thumbnailLink.href = `/game/${game}/`; // Replace with actual link if needed
            const thumbnailImage = document.createElement('img');
            thumbnailImage.classList.add('thumbnailImage');
            thumbnailImage.src = `/Assets/cvimg_${game}.png` // Replace with profile picture later
            thumbnailImage.alt = 'Game Thumbnail';
            thumbnailLink.appendChild(thumbnailImage);
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

loadUserPage();

document.addEventListener("DOMContentLoaded", () => {
    fetch('/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById("navbar-container").innerHTML = html;
        })
        .catch(err => console.error("Error loading navbar:", err));
});