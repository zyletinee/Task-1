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

const title = document.getElementById("title");
const description = document.getElementById("descriptionText");
const ratingLink = document.getElementById("ratingLink");
const devLink = document.getElementById("devLink");
const pubLink = document.getElementById("pubLink");
const genres = document.getElementById("genre");
const platforms = document.getElementById("platforms");
const release = document.getElementById("releaseDate");
const cover = document.getElementById("coverArt");
const writeReview = document.getElementById("writeReview");

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
